module.exports = (sequelize, DataTypes) => {
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
      allowNull: false,
      comment: 'motion_detected, bird_detected, bat_detected, etc.'
    },
    confidence: {
      type: DataTypes.FLOAT,
      comment: 'Detection confidence 0-1'
    },
    metadata: {
      type: DataTypes.JSONB,
      comment: 'Additional event data'
    },
    device_timestamp: DataTypes.DATE,
    createdAt: DataTypes.DATE
  }, {
    timestamps: true,
    indexes: [
      { fields: ['deviceId', 'event_type', 'createdAt'] },
      { fields: ['event_type'] },
      { fields: ['createdAt'] }
    ]
  });

  Event.associate = (models) => {
    Event.belongsTo(models.Device, {
      foreignKey: 'deviceId',
      as: 'device'
    });
  };

  return Event;
};
