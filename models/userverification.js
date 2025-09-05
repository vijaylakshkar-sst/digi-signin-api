'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserVerification = sequelize.define('UserVerification', {
    email: DataTypes.STRING,
    otp: DataTypes.STRING,
    data: DataTypes.JSON,
    expiresAt: DataTypes.DATE
  });

  return UserVerification;
};
