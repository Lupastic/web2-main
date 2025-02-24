const express = require('express');
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
    logoutUser,
    getTopUsersWithTopicCounts 
} = require('../controllers/usersController');

const { verifyToken } = require('../middleware/authMiddleware');
router.post('/register', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/login', loginUser);
router.post('/logout', verifyToken, logoutUser);
module.exports = router;