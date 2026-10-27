const path = require('path');
const fs = require('fs');
const Resource = require('../models/Resource');
const Bookmark = require('../models/Bookmark');
const Review = require('../models/Review');
const Report = require('../models/Report');
const DownloadHistory = require('../models/DownloadHistory');
const { cloudinary, isCloudinaryConfigured } = require('../config/storage');

// Helper to recalculate average rating for a resource
const recalculateRating = async (resourceId) => {
  const reviews = await Review.find({ resource: resourceId });
  if (reviews.length === 0) {
    await Resource.findByIdAndUpdate(resourceId, {
      averageRating: 0,
      ratingCount: 0,
    });
    return { averageRating: 0, ratingCount: 0 };
  }

  const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
  const avg = Number((sum / reviews.length).toFixed(1));

  await Resource.findByIdAndUpdate(resourceId, {
    averageRating: avg,
    ratingCount: reviews.length,
  });

  return { averageRating: avg, ratingCount: reviews.length };
};

// @desc    Get all resources with search, filtering, sorting, pagination
// @route   GET /api/resources
// @access  Public
const getAllResources = async (req, res, next) => {
  try {
    const {
      search,
      branch,
      semester,
      subject,
      resourceType,
      sort,
      page = 1,
      limit = 9,
    } = req.query;

    const query = { moderationStatus: 'approved' };

    // Search query: using regex or text search
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { subject: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
      ];
    }

    if (branch && branch !== 'All') {
      query.branch = branch;
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    if (subject && subject.trim() !== '') {
      query.subject = new RegExp(subject.trim(), 'i');
    }

    if (resourceType && resourceType !== 'All') {
      query.resourceType = resourceType;
    }

    // Sort order
    let sortOption = { createdAt: -1 }; // default newest
    if (sort === 'popular' || sort === 'downloads') {
      sortOption = { downloadCount: -1, createdAt: -1 };
    } else if (sort === 'rating') {
      sortOption = { averageRating: -1, ratingCount: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * limitNum;

    const [resources, totalCount] = await Promise.all([
      Resource.find(query)
        .populate('uploader', 'name email branch')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Resource.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: resources,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get landing page highlights (popular, recent, stats)
// @route   GET /api/resources/highlights
// @access  Public
const getHighlights = async (req, res, next) => {
  try {
    const approvedQuery = { moderationStatus: 'approved' };

    const [popular, recent, totalResources, totalDownloads] = await Promise.all([
      Resource.find(approvedQuery)
        .populate('uploader', 'name email')
        .sort({ downloadCount: -1, averageRating: -1 })
        .limit(6)
        .lean(),
      Resource.find(approvedQuery)
        .populate('uploader', 'name email')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Resource.countDocuments(approvedQuery),
      Resource.aggregate([
        { $match: approvedQuery },
        { $group: { _id: null, total: { $sum: '$downloadCount' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      popular,
      recent,
      stats: {
        totalResources,
        totalDownloads: totalDownloads[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource by ID with reviews and bookmark state
// @route   GET /api/resources/:id
// @access  Public (optionalAuth)
const getResourceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id).populate(
      'uploader',
      'name email branch semester createdAt'
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.',
      });
    }

    // Check visibility if not approved
    if (resource.moderationStatus !== 'approved') {
      const isUploader = req.user && resource.uploader._id.toString() === req.user._id.toString();
      const isAdmin = req.user && req.user.role === 'admin';
      if (!isUploader && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This resource is pending approval or has been moderated.',
        });
      }
    }

    // Increment view count
    resource.viewCount += 1;
    await resource.save();

    // Fetch reviews
    const reviews = await Review.find({ resource: id })
      .populate('user', 'name branch avatar')
      .sort({ createdAt: -1 })
      .lean();

    // Check if current user has bookmarked or reviewed
    let isBookmarked = false;
    let userReview = null;

    if (req.user) {
      const [bookmark, review] = await Promise.all([
        Bookmark.findOne({ user: req.user._id, resource: id }),
        Review.findOne({ user: req.user._id, resource: id }),
      ]);
      isBookmarked = Boolean(bookmark);
      userReview = review;
    }

    res.status(200).json({
      success: true,
      data: resource,
      reviews,
      isBookmarked,
      userReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / Upload new resource
// @route   POST /api/resources
// @access  Private
const createResource = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please choose a file to upload.',
      });
    }

    const {
      title,
      description,
      subject,
      branch,
      semester,
      resourceType,
      tags,
    } = req.body;

    if (!title || !subject || !branch || !semester || !resourceType) {
      // Clean up uploaded file if validation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, subject, branch, semester, and resource type.',
      });
    }

    let fileUrl = '';
    let storageIdentifier = '';
    let storageProvider = 'local';

    // If Cloudinary configured, stream to Cloudinary
    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'auto',
          folder: process.env.CLOUDINARY_FOLDER || 'notenest_uploads',
          public_id: path.parse(req.file.filename).name,
        });
        fileUrl = uploadResult.secure_url;
        storageIdentifier = uploadResult.public_id;
        storageProvider = 'cloudinary';

        // Delete temporary local file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cloudErr) {
        console.error('[Cloudinary Upload Error]:', cloudErr);
        // Fallback to local storage if Cloudinary upload fails
        fileUrl = `/uploads/${req.file.filename}`;
        storageIdentifier = req.file.filename;
        storageProvider = 'local';
      }
    } else {
      // Local storage
      fileUrl = `/uploads/${req.file.filename}`;
      storageIdentifier = req.file.filename;
      storageProvider = 'local';
    }

    // Process tags
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map((t) => t.trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        processedTags = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    const newResource = await Resource.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      subject: subject.trim(),
      branch,
      semester: Number(semester),
      resourceType,
      fileUrl,
      storageIdentifier,
      storageProvider,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploader: req.user._id,
      moderationStatus: 'approved', // Instant publishing for college demo
      tags: processedTags,
    });

    const populatedResource = await Resource.findById(newResource._id).populate(
      'uploader',
      'name email branch'
    );

    res.status(201).json({
      success: true,
      message: 'Resource uploaded successfully!',
      data: populatedResource,
    });
  } catch (error) {
    // Clean up local temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Failed to unlink file on error:', e);
      }
    }
    next(error);
  }
};

// @desc    Update an owned resource
// @route   PUT /api/resources/:id
// @access  Private (Owner or Admin)
const updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, subject, branch, semester, resourceType, tags } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Check ownership or admin
    const isOwner = resource.uploader.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this resource.',
      });
    }

    if (title) resource.title = title.trim();
    if (description !== undefined) resource.description = description.trim();
    if (subject) resource.subject = subject.trim();
    if (branch) resource.branch = branch;
    if (semester) resource.semester = Number(semester);
    if (resourceType) resource.resourceType = resourceType;

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        resource.tags = tags.map((t) => t.trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        resource.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
      }
    }

    await resource.save();

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully!',
      data: resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an owned resource or admin moderate
// @route   DELETE /api/resources/:id
// @access  Private (Owner or Admin)
const deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const isOwner = resource.uploader.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this resource.',
      });
    }

    // Clean up physical file
    if (resource.storageProvider === 'cloudinary' && isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(resource.storageIdentifier);
      } catch (e) {
        console.error('Failed to delete from Cloudinary:', e);
      }
    } else {
      const localFilePath = path.join(__dirname, '../../uploads', resource.storageIdentifier);
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch (e) {
          console.error('Failed to delete local file:', e);
        }
      }
    }

    // Clean up related records
    await Promise.all([
      Bookmark.deleteMany({ resource: id }),
      Review.deleteMany({ resource: id }),
      Report.deleteMany({ resource: id }),
      DownloadHistory.deleteMany({ resource: id }),
      Resource.findByIdAndDelete(id),
    ]);

    res.status(200).json({
      success: true,
      message: 'Resource and associated data removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download resource file & track history
// @route   POST /api/resources/:id/download
// @access  Public (Optional auth for tracking history)
const downloadResource = async (req, res, next) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Increment download count
    resource.downloadCount += 1;
    await resource.save();

    // Record user download history if authenticated
    if (req.user) {
      await DownloadHistory.create({
        user: req.user._id,
        resource: id,
      });
    }

    if (resource.storageProvider === 'cloudinary') {
      return res.status(200).json({
        success: true,
        downloadUrl: resource.fileUrl,
        filename: resource.originalFilename,
        downloadCount: resource.downloadCount,
      });
    }

    // Local file delivery
    const filePath = path.join(__dirname, '../../uploads', resource.storageIdentifier);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on storage server.',
      });
    }

    // Return download metadata and streaming endpoint
    return res.status(200).json({
      success: true,
      downloadUrl: `/uploads/${resource.storageIdentifier}`,
      filename: resource.originalFilename,
      downloadCount: resource.downloadCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate or review a resource
// @route   POST /api/resources/:id/reviews
// @access  Private
const rateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a whole number between 1 and 5.',
      });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Upsert review
    const review = await Review.findOneAndUpdate(
      { user: req.user._id, resource: id },
      { rating: Number(rating), comment: comment ? comment.trim() : '' },
      { new: true, upsert: true, runValidators: true }
    );

    // Recalculate average rating on Resource
    const updatedStats = await recalculateRating(id);

    res.status(200).json({
      success: true,
      message: 'Thank you for your rating!',
      review,
      averageRating: updatedStats.averageRating,
      ratingCount: updatedStats.ratingCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Report an inappropriate resource
// @route   POST /api/resources/:id/reports
// @access  Private
const reportResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid reason for reporting this resource.',
      });
    }

    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      resource: id,
      reason,
      details: details ? details.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will review this content.',
      reportId: report._id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllResources,
  getHighlights,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  downloadResource,
  rateResource,
  reportResource,
};

