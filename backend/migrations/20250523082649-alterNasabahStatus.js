'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_nasabah_status";');
    await queryInterface.addColumn('nasabah', 'status', {
      type: Sequelize.ENUM('Aktif', 'Tidak Aktif'),
      allowNull: false,
      defaultValue: 'Tidak Aktif'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('nasabah', 'status');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_nasabah_status";');
  }
};