const express = require('express');
const router = express.Router();
const {
    createTopic,
    getAllTopics,
    getTopicById,
    updateTopic,
    deleteTopic,
    likeTopic // Import the new function
} = require('../controllers/topicsController'); // add likeTopic function

const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createTopic);
router.get('/', getAllTopics);
router.get('/:id', getTopicById);
router.put('/:id', verifyToken, updateTopic);
router.delete('/:id', verifyToken, deleteTopic);
router.post('/:id/like', verifyToken, likeTopic); 

module.exports = router;