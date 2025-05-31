"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tagihan_pinjaman', {
      tagihan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      pinjaman_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'pinjaman',
          key: 'pinjaman_id',
        },
        onDelete: 'CASCADE',
      },
      tanggalTagihan: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      jumlahTagihan: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("BELUM_BAYAR", "LUNAS"),
        allowNull: false,
        defaultValue: "BELUM_BAYAR"
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tagihan_pinjaman');
  }
};
