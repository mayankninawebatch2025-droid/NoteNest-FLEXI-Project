const express = require('express');
const router = express.Router();
const { addBookmark, removeBookmark } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.post('/:resourceId', requireAuth, addBookmark);
router.delete('/:resourceId', requireAuth, removeBookmark);

module.exports = router;

