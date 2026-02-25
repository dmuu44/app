const express = require('express');
const {
  getAllContent,
  getContentById,
  createContent,
  updateContent,
  getCategories,
} = require('../controllers/contentController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', optionalAuth, getAllContent);
router.get('/categories', getCategories);
router.get('/:id', optionalAuth, getContentById);
router.post('/', authenticateToken, createContent);
router.put('/:id', authenticateToken, updateContent);

module.exports = router;