const { DataTypes } = require('sequelize');
const sequelize = require('../index').sequelize;

const CameraImage = sequelize.define('CameraImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  deviceId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  filename: DataTypes.STRING,
  local_path: DataTypes.STRING,
  s3_url: DataTypes.STRING,
  file_size: DataTypes.INTEGER,
  mime_type: DataTypes.STRING,
  motion_triggered: DataTypes.BOOLEAN,
  is_night_vision: DataTypes.BOOLEAN,
  device_timestamp: DataTypes.DATE
}, {
  timestamps: true,
  tableName: 'camera_images'
});

module.exports = CameraImage;
