export default {
  up: async (queryInterface, sequelize) => {
    await queryInterface.createTable('debit', {
      nomorRekeningTujuan: {
        type: sequelize.STRING,
        allowNull: false,
      },
      jumlahSaldoBerkurang: {
        type: sequelize.DOUBLE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, sequelize) => {
    await queryInterface.dropTable('debit');
  },
};
