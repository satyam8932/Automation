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

// De-assign (Revoke) a user from a room
const deassignRoom = async (req, res) => {
  const { userId, roomId } = req.body;
  const room = await Room.findByPk(roomId);
  const user = await User.findByPk(userId);

  if (room && user) {
    await room.removeUser(user);  // Removes the association between the room and the user
    res.status(200).json({ message: 'User de-assigned from room' });
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

// Fetch assigned rooms for the current user
const getUserAssignedRooms = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming req.user is populated from auth middleware

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Room,
          as: 'rooms',  // Ensure this matches the alias used in your model
          attributes: ['id', 'name'], // Only include necessary room fields
          through: { attributes: [] }, // Hide join table attributes
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Clean the data and only return essential room info
    const assignedRooms = user.rooms.map(room => ({
      id: room.id,
      name: room.name
    }));

    res.status(200).json({ rooms: assignedRooms });
  } catch (error) {
    console.error('Error fetching assigned rooms:', error);
    res.status(500).json({ message: 'Failed to fetch assigned rooms' });
  }
};

module.exports = { assignRoom, deassignRoom, joinRoom, getUserAssignedRooms };
