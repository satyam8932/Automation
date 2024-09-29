const Room = require('../models/room');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// Create a new room
const createRoom = async (req, res) => {
  const { name, password } = req.body;

  // Hash room password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newRoom = await Room.create({ name, password: hashedPassword });
    res.status(201).json({ message: 'Room created', room: newRoom });
  } catch (error) {
    res.status(400).json({ error: 'Error creating room' });
  }
};

// Delete an existing room
const deleteRoom = async (req, res) => {
  const { roomId } = req.body;

  try {
    await Room.destroy({ where: { id: roomId } });
    res.status(200).json({ message: 'Room deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting room' });
  }
};

// Get All Rooms Controller
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.status(200).json({ rooms });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Get All Users Controller
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Fetch users with the rooms they are assigned to
const getUsersWithRooms = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Room,
          as: 'rooms',  // Adjust this alias if necessary based on your associations
          through: {
            attributes: [],  // This hides any join table attributes
          },
          attributes: ['id', 'name'],  // Only include necessary room fields
        },
      ],
    });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users with rooms', error });
  }
};

module.exports = { createRoom, deleteRoom, getAllRooms, getAllUsers, getUsersWithRooms };
