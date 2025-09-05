module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    fullname: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    address: DataTypes.STRING,
    password: DataTypes.STRING,
    token: DataTypes.STRING,
    role_id: DataTypes.INTEGER
  }, {
    paranoid: true
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'role_id',
      as: 'role'
    });
  };

  return User;
};
