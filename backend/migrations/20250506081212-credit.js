"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('credit', {
      credit_id: {
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
      jumlahSaldoBertambah: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('credit');
  },
};
