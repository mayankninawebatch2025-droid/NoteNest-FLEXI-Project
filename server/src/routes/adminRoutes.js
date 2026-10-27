const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  updateUser,
  getModerationQueue,
  moderateResource,
  getReports,
  resolveReport,
} = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// Protect all admin routes with authentication and admin role verification
router.use(requireAuth, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/moderation', getModerationQueue);
router.put('/moderation/:id', moderateResource);
router.get('/reports', getReports);
router.put('/reports/:id', resolveReport);

module.exports = router;

