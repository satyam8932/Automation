const express = require('express');
const { createRoom, deleteRoom } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/create-room', authMiddleware, adminMiddleware, createRoom);
router.delete('/delete-room', authMiddleware, adminMiddleware, deleteRoom);

module.exports = router;
