module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: { isEmail: true }
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    organization: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'researcher', 'citizen_scientist', 'viewer'),
      defaultValue: 'citizen_scientist'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login_at: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    timestamps: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] }
    ]
  });

  User.associate = (models) => {
    User.hasMany(models.Device, {
      foreignKey: 'userId',
      as: 'devices'
    });
  };

  return User;
};
