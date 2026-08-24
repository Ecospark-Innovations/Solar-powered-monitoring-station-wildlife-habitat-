const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  deviceId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  event_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  confidence: DataTypes.FLOAT,
  metadata: DataTypes.JSONB,
  camera_image_id: DataTypes.UUID
}, {
  timestamps: true,
  tableName: 'events'
});

module.exports = Event;
