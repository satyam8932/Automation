const express = require('express');
const { joinRoom } = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/join-room', authMiddleware, joinRoom);

module.exports = router;
