"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transfer', {
      transfer_id: {
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
      fromRekening: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      toRekening: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      berita: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transfer');
  },
};
