const express = require('express');
const { assignRoom, joinRoom } = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/assign-room', authMiddleware, assignRoom);
router.post('/join-room', authMiddleware, joinRoom);

module.exports = router;
