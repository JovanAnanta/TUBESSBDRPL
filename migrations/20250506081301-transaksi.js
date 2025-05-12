export default {
  up: async (queryInterface, sequelize) => {
    await queryInterface.createTable('transaksi', {
      transaksi_id: {
        type: sequelize.UUID,
        defaultValue: sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      nasabah_id: {
        type: sequelize.UUID,
        allowNull: false,
        references: {
          model: 'nasabah', // Nama tabel yang menjadi referensi
          key: 'nasabah_id', // Kolom yang menjadi referensi pada model Nasabah
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      transaksiType: {
        type: sequelize.ENUM('MASUK', 'KELUAR'),
        allowNull: false,
      },
      statusType: {
        type: sequelize.ENUM('BERHASIL', 'TERTUNDA', 'GAGAL'),
        allowNull: false,
      },
      tanggalTransaksi: {
        type: sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, sequelize) => {
    await queryInterface.dropTable('transaksi');
  },
};
