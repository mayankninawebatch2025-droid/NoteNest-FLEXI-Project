const User = require('../models/User');
const Resource = require('../models/Resource');
const Report = require('../models/Report');
const Bookmark = require('../models/Bookmark');
const Review = require('../models/Review');
const DownloadHistory = require('../models/DownloadHistory');
const fs = require('fs');
const path = require('path');
const { cloudinary, isCloudinaryConfigured } = require('../config/storage');

// @desc    Get system-wide summary statistics for admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      studentCount,
      adminCount,
      totalResources,
      approvedResources,
      pendingResources,
      rejectedResources,
      pendingReports,
      totalDownloadsAgg,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'admin' }),
      Resource.countDocuments(),
      Resource.countDocuments({ moderationStatus: 'approved' }),
      Resource.countDocuments({ moderationStatus: 'pending' }),
      Resource.countDocuments({ moderationStatus: 'rejected' }),
      Report.countDocuments({ status: 'pending' }),
      Resource.aggregate([
        { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } },
      ]),
    ]);

    const totalDownloads = totalDownloadsAgg[0]?.totalDownloads || 0;

    // Breakdown by branch
    const branchBreakdown = await Resource.aggregate([
      { $group: { _id: '$branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Breakdown by resource type
    const typeBreakdown = await Resource.aggregate([
      { $group: { _id: '$resourceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: studentCount,
          admins: adminCount,
        },
        resources: {
          total: totalResources,
          approved: approvedResources,
          pending: pendingResources,
          rejected: rejectedResources,
        },
        downloads: totalDownloads,
        pendingReports,
      },
      charts: {
        byBranch: branchBreakdown,
        byType: typeBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user list with search and filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { branch: searchRegex }];
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [users, totalCount] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role or active status
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    // Prevent modifying yourself
    if (id === req.user._id.toString() && role && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot revoke your own administrator role.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role && ['student', 'admin'].includes(role)) {
      user.role = role;
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resources moderation queue
// @route   GET /api/admin/moderation
// @access  Private (Admin)
const getModerationQueue = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 15 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.moderationStatus = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { subject: searchRegex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [resources, totalCount] = await Promise.all([
      Resource.find(query)
        .populate('uploader', 'name email branch')
        .populate('moderatedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Resource.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: resources,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate resource (approve / reject)
// @route   PUT /api/admin/moderation/:id
// @access  Private (Admin)
const moderateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved, pending, or rejected.',
      });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    resource.moderationStatus = status;
    resource.moderatedBy = req.user._id;
    if (note !== undefined) {
      resource.moderationNote = note.trim();
    }

    await resource.save();

    res.status(200).json({
      success: true,
      message: `Resource has been marked as ${status}.`,
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [reports, totalCount] = await Promise.all([
      Report.find(query)
        .populate('reporter', 'name email')
        .populate({
          path: 'resource',
          populate: { path: 'uploader', select: 'name email' },
        })
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Report.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: pageNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resolve or dismiss a report (optionally remove resource)
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin)
const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote, deleteResource } = req.body;

    if (!['resolved', 'dismissed', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be resolved, dismissed, or pending.',
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status;
    report.reviewedBy = req.user._id;
    if (resolutionNote) {
      report.resolutionNote = resolutionNote.trim();
    }

    // If requested to delete offending resource
    if (deleteResource && report.resource) {
      const resource = await Resource.findById(report.resource);
      if (resource) {
        if (resource.storageProvider === 'cloudinary' && isCloudinaryConfigured()) {
          try {
            await cloudinary.uploader.destroy(resource.storageIdentifier);
          } catch (e) {
            console.error('Failed to delete Cloudinary file:', e);
          }
        } else {
          const localPath = path.join(__dirname, '../../uploads', resource.storageIdentifier);
          if (fs.existsSync(localPath)) {
            try {
              fs.unlinkSync(localPath);
            } catch (e) {
              console.error('Failed to delete local file:', e);
            }
          }
        }

        await Promise.all([
          Bookmark.deleteMany({ resource: resource._id }),
          Review.deleteMany({ resource: resource._id }),
          DownloadHistory.deleteMany({ resource: resource._id }),
          Resource.findByIdAndDelete(resource._id),
        ]);
      }
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: `Report marked as ${status}${deleteResource ? ' and resource was deleted' : ''}.`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  updateUser,
  getModerationQueue,
  moderateResource,
  getReports,
  resolveReport,
};

