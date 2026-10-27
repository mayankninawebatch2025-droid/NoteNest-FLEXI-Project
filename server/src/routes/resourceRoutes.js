const express = require('express');
const router = express.Router();
const {
  getAllResources,
  getHighlights,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  downloadResource,
  rateResource,
  reportResource,
} = require('../controllers/resourceController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', optionalAuth, getAllResources);
router.get('/highlights', getHighlights);
router.get('/:id', optionalAuth, getResourceById);
router.post('/', requireAuth, upload.single('file'), createResource);
router.put('/:id', requireAuth, updateResource);
router.delete('/:id', requireAuth, deleteResource);
router.post('/:id/download', optionalAuth, downloadResource);
router.post('/:id/reviews', requireAuth, rateResource);
router.post('/:id/reports', requireAuth, reportResource);

module.exports = router;

