const express = require('express');
const router = express.Router();
const { createComment, getAllComments, updateComment, deleteComment } = require('../controllers/commentsController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', createComment);
router.get('/', getAllComments);
router.put('/:id', updateComment);
router.delete('/:id', deleteComment);
module.exports = router;