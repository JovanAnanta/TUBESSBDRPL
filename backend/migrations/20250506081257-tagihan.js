export default{
  up: async (queryInterface, sequelize) => {
    await queryInterface.createTable('tagihan', {
      statusTagihanType: {
        type: sequelize.ENUM('AIR', 'LISTRIK'),
        allowNull: false,
      },
      jumlahSaldoBerkurang: {
        type: sequelize.DOUBLE,
        allowNull: false,
      },
      nomorTagihan: {
        type: sequelize.STRING,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, sequelize) => {
    await queryInterface.dropTable('tagihan');
  },
};
