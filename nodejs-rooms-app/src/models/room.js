const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const User = require('./user');

const Room = sequelize.define('Room', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Many-to-many relation between Room and User
Room.belongsToMany(User, { through: 'UserRooms' });
User.belongsToMany(Room, { through: 'UserRooms' });

module.exports = Room;
