module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: DataTypes.STRING
  }, {
    paranoid: true
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, {
      foreignKey: 'role_id',
      as: 'users'
    });
  };

  return Role;
};
