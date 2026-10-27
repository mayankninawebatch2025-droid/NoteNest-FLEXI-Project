const Resource = require('../models/Resource');
const Bookmark = require('../models/Bookmark');
const DownloadHistory = require('../models/DownloadHistory');

// @desc    Get resources uploaded by current user
// @route   GET /api/users/me/resources
// @access  Private
const getUserResources = async (req, res, next) => {
  try {
    const resources = await Resource.find({ uploader: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      total: resources.length,
      approved: resources.filter((r) => r.moderationStatus === 'approved').length,
      pending: resources.filter((r) => r.moderationStatus === 'pending').length,
      rejected: resources.filter((r) => r.moderationStatus === 'rejected').length,
      totalDownloads: resources.reduce((acc, r) => acc + (r.downloadCount || 0), 0),
    };

    res.status(200).json({
      success: true,
      data: resources,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookmarked resources of current user
// @route   GET /api/users/me/bookmarks
// @access  Private
const getUserBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate({
        path: 'resource',
        populate: { path: 'uploader', select: 'name email' },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out any bookmarks whose resources might have been deleted
    const validBookmarks = bookmarks
      .filter((b) => b.resource && b.resource._id)
      .map((b) => ({
        _id: b._id,
        createdAt: b.createdAt,
        resource: b.resource,
      }));

    res.status(200).json({
      success: true,
      data: validBookmarks,
      count: validBookmarks.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a bookmark
// @route   POST /api/bookmarks/:resourceId
// @access  Private
const addBookmark = async (req, res, next) => {
  try {
    const { resourceId } = req.params;

    // Check if resource exists
    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Check if already bookmarked
    const existing = await Bookmark.findOne({
      user: req.user._id,
      resource: resourceId,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Resource is already in your bookmarks.',
        isBookmarked: true,
      });
    }

    await Bookmark.create({
      user: req.user._id,
      resource: resourceId,
    });

    res.status(201).json({
      success: true,
      message: 'Resource added to your bookmarks!',
      isBookmarked: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a bookmark
// @route   DELETE /api/bookmarks/:resourceId
// @access  Private
const removeBookmark = async (req, res, next) => {
  try {
    const { resourceId } = req.params;

    await Bookmark.findOneAndDelete({
      user: req.user._id,
      resource: resourceId,
    });

    res.status(200).json({
      success: true,
      message: 'Resource removed from bookmarks.',
      isBookmarked: false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's download history
// @route   GET /api/users/me/download-history
// @access  Private
const getUserDownloadHistory = async (req, res, next) => {
  try {
    const history = await DownloadHistory.find({ user: req.user._id })
      .populate({
        path: 'resource',
        populate: { path: 'uploader', select: 'name email' },
      })
      .sort({ downloadedAt: -1 })
      .limit(50)
      .lean();

    const validHistory = history.filter((h) => h.resource && h.resource._id);

    res.status(200).json({
      success: true,
      data: validHistory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserResources,
  getUserBookmarks,
  addBookmark,
  removeBookmark,
  getUserDownloadHistory,
};

