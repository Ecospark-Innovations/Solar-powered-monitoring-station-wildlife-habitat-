'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  {
    dialect: 'postgres',
    logging: env === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

// Load models
fs
  .readdirSync(__dirname + '/models')
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, 'models', file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Execute associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
