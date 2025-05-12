export default {
  up: async (queryInterface, sequelize) => {
    await queryInterface.createTable('pinjaman', {
      statusJatuhTempo: {
        type: sequelize.ENUM('6BULAN', '12BULAN', '24BULAN'),
        allowNull: false,
      },
      jumlahPerBulan: {
        type: sequelize.DOUBLE,
        allowNull: false,
      },
      jumlahSaldoBerkurang: {
        type: sequelize.DOUBLE,
        allowNull: false,
      },
      tanggalJatuhTempo: {
        type: sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, sequelize) => {
    await queryInterface.dropTable('pinjaman');
  },
};
