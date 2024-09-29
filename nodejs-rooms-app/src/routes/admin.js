const express = require('express');
const { createRoom, deleteRoom, getAllRooms, getAllUsers, getUsersWithRooms } = require('../controllers/adminController');
const { assignRoom, deassignRoom } = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Route to create a room
router.post('/create-room', authMiddleware, adminMiddleware, createRoom);

// Route to delete a room
router.delete('/delete-room', authMiddleware, adminMiddleware, deleteRoom);

// Route to assign a room to a user
router.post('/assign-room', authMiddleware, adminMiddleware, assignRoom);

// Route to de assign a room to a user
router.post('/deassign-room', authMiddleware, adminMiddleware, deassignRoom);

// Route to fetch all rooms
router.get('/rooms', authMiddleware, adminMiddleware, getAllRooms);

// Route to fetch all users
router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

// Route to fetch users with the rooms they are assigned to
router.get('/users-with-rooms', authMiddleware, adminMiddleware, getUsersWithRooms);

module.exports = router;
