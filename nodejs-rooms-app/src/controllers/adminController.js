const Room = require('../models/room');
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

module.exports = { createRoom, deleteRoom };
