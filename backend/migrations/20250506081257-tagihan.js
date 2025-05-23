"use strict";

/** @type {import('sequelize-cli').Migration} */

export default {
  async up(queryInterface, Sequelize) {
    queryInterface.createTable('tagihan', {
      tagihan_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      transaksi_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "transaksi",
          key: "transaksi_id",
        },
        onDelete: "CASCADE",
      },
      statusTagihanType: {
        type: Sequelize.ENUM('AIR', 'LISTRIK'),
        allowNull: false
      },
      nomorTagihan: {
        type: Sequelize.STRING,
        allowNull: false
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tagihan');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_tagihan_statusTagihanType;');
  }
};