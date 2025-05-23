import { Sequelize } from "sequelize";

export default {
  up: async (queryInterface, sequelize) => {
    await queryInterface.createTable('credit', {
      nomorRekeningAsal: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      jumlahSaldoBertambah: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, sequelize) => {
    await queryInterface.dropTable('credit');
  },
};
