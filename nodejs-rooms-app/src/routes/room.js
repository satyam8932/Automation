const express = require('express');
const { joinRoom, getUserAssignedRooms } = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/join-room', authMiddleware, joinRoom);

router.get('/get-user-assigned-room', authMiddleware, getUserAssignedRooms);

module.exports = router;
