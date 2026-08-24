const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  deviceId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: DataTypes.TEXT,
  habitat_type: {
    type: DataTypes.ENUM('birdhouse', 'bat_box', 'pollinator_shelter', 'small_mammal_refuge'),
    allowNull: false
  },
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'error'),
    defaultValue: 'active'
  },
  battery_percentage: DataTypes.FLOAT,
  battery_voltage: DataTypes.FLOAT,
  solar_voltage: DataTypes.FLOAT,
  last_telemetry_at: DataTypes.DATE,
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'devices'
});

module.exports = Device;
