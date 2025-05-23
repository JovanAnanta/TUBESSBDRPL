'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable('tagihan', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      statusTagihanType: {
        type: Sequelize.ENUM('AIR', 'LISTRIK'),
        allowNull: false
      },
      jumlahSaldoBerkurang: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      nomorTagihan: {
        type: Sequelize.STRING,
        allowNull: false
      },
    });
  },
};

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tagihan');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_tagihan_statusTagihanType;');
  }