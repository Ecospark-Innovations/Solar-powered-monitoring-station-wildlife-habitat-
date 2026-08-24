const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: { isEmail: true }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: DataTypes.STRING,
  last_name: DataTypes.STRING,
  organization: DataTypes.STRING,
  role: {
    type: DataTypes.ENUM('citizen_scientist', 'researcher', 'admin'),
    defaultValue: 'citizen_scientist'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login_at: DataTypes.DATE
}, {
  timestamps: true,
  tableName: 'users'
});

module.exports = User;
