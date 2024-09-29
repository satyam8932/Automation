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

// Many-to-many relation between Room and User with aliases
Room.belongsToMany(User, { through: 'UserRooms', as: 'users' });  // Alias 'users'
User.belongsToMany(Room, { through: 'UserRooms', as: 'rooms' });  // Alias 'rooms'

module.exports = Room;
