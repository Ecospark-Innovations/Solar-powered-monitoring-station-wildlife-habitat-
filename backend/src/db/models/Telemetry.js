module.exports = (sequelize, DataTypes) => {
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
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Temperature in Celsius'
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Humidity percentage'
    },
    pressure: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Barometric pressure in hPa'
    },
    voc: {
      type: DataTypes.FLOAT,
      comment: 'Volatile Organic Compounds in ppm'
    },
    pm25: {
      type: DataTypes.FLOAT,
      comment: 'Particulate Matter 2.5µm in µg/m³'
    },
    pm10: {
      type: DataTypes.FLOAT,
      comment: 'Particulate Matter 10µm in µg/m³'
    },
    uv_index: {
      type: DataTypes.FLOAT,
      comment: 'UV Index'
    },
    uva: {
      type: DataTypes.FLOAT,
      comment: 'UVA intensity'
    },
    uvb: {
      type: DataTypes.FLOAT,
      comment: 'UVB intensity'
    },
    battery_voltage: DataTypes.FLOAT,
    battery_percentage: DataTypes.FLOAT,
    solar_voltage: DataTypes.FLOAT,
    rssi: {
      type: DataTypes.INTEGER,
      comment: 'WiFi signal strength in dBm'
    },
    motion_detected: DataTypes.BOOLEAN,
    device_timestamp: DataTypes.DATE,
    createdAt: DataTypes.DATE
  }, {
    timestamps: true,
    indexes: [
      { fields: ['deviceId', 'createdAt'] },
      { fields: ['createdAt'] },
      { fields: ['temperature', 'humidity'] }
    ]
  });

  Telemetry.associate = (models) => {
    Telemetry.belongsTo(models.Device, {
      foreignKey: 'deviceId',
      as: 'device'
    });
  };

  return Telemetry;
};
