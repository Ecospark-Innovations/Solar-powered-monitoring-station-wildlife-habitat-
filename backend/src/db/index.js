const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://wildlife:changeme@localhost:5432/wildlife_monitoring', {
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 10, min: 2, idle: 10000 },
  dialect: 'postgres'
});

// Import models
const User = require('./models/User');
const Device = require('./models/Device');
const Telemetry = require('./models/Telemetry');
const Event = require('./models/Event');
const CameraImage = require('./models/CameraImage');

// Define associations
User.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'userId' });
Device.hasMany(Telemetry, { foreignKey: 'deviceId', as: 'telemetry' });
Telemetry.belongsTo(Device, { foreignKey: 'deviceId' });
Device.hasMany(Event, { foreignKey: 'deviceId', as: 'events' });
Event.belongsTo(Device, { foreignKey: 'deviceId' });
Device.hasMany(CameraImage, { foreignKey: 'deviceId', as: 'images' });
CameraImage.belongsTo(Device, { foreignKey: 'deviceId' });

// Sync database
sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => console.log('✅ Database synced'))
  .catch(err => console.error('❌ Database sync error:', err));

module.exports = {
  sequelize,
  User,
  Device,
  Telemetry,
  Event,
  CameraImage
};
