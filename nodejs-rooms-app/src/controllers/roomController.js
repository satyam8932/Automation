const Room = require('../models/room');
const User = require('../models/user');

// Assign a user to a room
const assignRoom = async (req, res) => {
  const { userId, roomId } = req.body;
  const room = await Room.findByPk(roomId);
  const user = await User.findByPk(userId);

  if (room && user) {
    await room.addUser(user);
    res.status(200).json({ message: 'User assigned to room' });
  } else {
    res.status(404).json({ message: 'Room or User not found' });
  }
};

// Join a room (for users)
const joinRoom = async (req, res) => {
  const { roomId } = req.body;
  const user = await User.findByPk(req.user.id); // req.user set by authMiddleware

  // Check if the user is assigned to this room
  const room = await Room.findByPk(roomId, {
    include: {
      model: User,
      where: { id: user.id },  // Check if user belongs to this room
    },
  });

  if (!room) {
    return res.status(403).json({ message: 'User not assigned to this room' });
  }

  res.status(200).json({ message: 'Joined room successfully', room });
};

module.exports = { assignRoom, joinRoom };
