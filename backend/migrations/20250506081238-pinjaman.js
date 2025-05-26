"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pinjaman', {
      pinjaman_id: {
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
      statusJatuhTempo: {
        type: Sequelize.ENUM('6BULAN', '12BULAN', '24BULAN'),
        allowNull: false,
      },
      jumlahPerBulan: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      tanggalJatuhTempo: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      statusPinjaman: {
        type: Sequelize.ENUM("ACCEPTED", "PENDING", "REJECTED"),
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pinjaman');
  },
};
