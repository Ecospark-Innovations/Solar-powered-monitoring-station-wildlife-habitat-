module.exports = (sequelize, DataTypes) => {
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
    s3_url: DataTypes.STRING,
    local_path: DataTypes.STRING,
    file_size: DataTypes.INTEGER,
    mime_type: {
      type: DataTypes.STRING,
      defaultValue: 'image/jpeg'
    },
    motion_triggered: DataTypes.BOOLEAN,
    wildlife_detected: DataTypes.BOOLEAN,
    detection_metadata: DataTypes.JSONB,
    is_night_vision: DataTypes.BOOLEAN,
    device_timestamp: DataTypes.DATE,
    createdAt: DataTypes.DATE
  }, {
    timestamps: true,
    indexes: [
      { fields: ['deviceId', 'createdAt'] },
      { fields: ['motion_triggered'] },
      { fields: ['wildlife_detected'] }
    ]
  });

  CameraImage.associate = (models) => {
    CameraImage.belongsTo(models.Device, {
      foreignKey: 'deviceId',
      as: 'device'
    });
  };

  return CameraImage;
};
