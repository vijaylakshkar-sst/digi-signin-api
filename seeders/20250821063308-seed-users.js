'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get roles
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM Roles;`
    );
    const roleMap = {};
    roles[0].forEach(role => {
      roleMap[role.name] = role.id;
    });

    const passwordHash = await bcrypt.hash('Password123!', 10);

    await queryInterface.bulkInsert('Users', [
      {
        fullname: 'Admin User',
        email: 'admin@example.com',
        mobile: '1234567890',
        address: 'Admin Address',
        profile_picture: null,
        password: passwordHash,
        token: null,
        role_id: roleMap['Admin'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fullname: 'Customer User',
        email: 'customer@example.com',
        mobile: '0987654321',
        address: 'Customer Address',
        profile_picture: null,
        password: passwordHash,
        token: null,
        role_id: roleMap['Customer'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {
      email: ['admin@example.com', 'tipster@example.com']
    });
  }
};
