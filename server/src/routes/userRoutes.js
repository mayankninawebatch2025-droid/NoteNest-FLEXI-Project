const express = require('express');
const router = express.Router();
const {
  getUserResources,
  getUserBookmarks,
  getUserDownloadHistory,
} = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.get('/me/resources', requireAuth, getUserResources);
router.get('/me/bookmarks', requireAuth, getUserBookmarks);
router.get('/me/download-history', requireAuth, getUserDownloadHistory);

module.exports = router;

