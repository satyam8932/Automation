const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('rooms_db', 'postgres', '12345', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
