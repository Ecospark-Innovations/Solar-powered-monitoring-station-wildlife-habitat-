module.exports = (sequelize, DataTypes) => {
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
    description: {
      type: DataTypes.TEXT
    },
    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: true
    },
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    habitat_type: {
      type: DataTypes.ENUM('birdhouse', 'bat_box', 'pollinator_shelter', 'small_mammal_refuge'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'error'),
      defaultValue: 'active'
    },
    battery_voltage: DataTypes.FLOAT,
    battery_percentage: DataTypes.FLOAT,
    solar_voltage: DataTypes.FLOAT,
    last_telemetry_at: DataTypes.DATE,
    firmware_version: DataTypes.STRING,
    api_key_hash: DataTypes.STRING,
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC'
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    timestamps: true,
    indexes: [
      { fields: ['deviceId'] },
      { fields: ['status'] },
      { fields: ['habitat_type'] }
    ]
  });

  Device.associate = (models) => {
    Device.hasMany(models.Telemetry, {
      foreignKey: 'deviceId',
      as: 'telemetry'
    });
    Device.hasMany(models.Event, {
      foreignKey: 'deviceId',
      as: 'events'
    });
    Device.hasMany(models.CameraImage, {
      foreignKey: 'deviceId',
      as: 'images'
    });
    Device.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'owner'
    });
  };

  return Device;
};
