const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;

const Telemetry = sequelize.define('Telemetry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  deviceId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  temperature: DataTypes.FLOAT,
  humidity: DataTypes.FLOAT,
  pressure: DataTypes.FLOAT,
  voc: DataTypes.FLOAT,
  pm25: DataTypes.FLOAT,
  pm10: DataTypes.FLOAT,
  uv_index: DataTypes.FLOAT,
  battery_voltage: DataTypes.FLOAT,
  solar_voltage: DataTypes.FLOAT,
  motion_detected: DataTypes.BOOLEAN,
  signal_strength: DataTypes.INTEGER
}, {
  timestamps: true,
  tableName: 'telemetry'
});

module.exports = Telemetry;
