'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_nasabah_status";');
    await queryInterface.addColumn('nasabah', 'status', {
      type: Sequelize.ENUM('AKTIF', 'TIDAK AKTIF'),
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('nasabah', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_nasabah_status";');
  }
};