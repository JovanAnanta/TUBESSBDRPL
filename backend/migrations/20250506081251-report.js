export default{
  up: async (queryInterface, sequelize) => {
    await queryInterface.createTable('report', {
      report_id: {
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
      email: {
        type: sequelize.STRING,
        allowNull: false,
      },
      deskripsi: {
        type: sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: sequelize.ENUM('DIABAIKAN', 'DIPROSES', 'DITERIMA'),
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, sequelize) => {
    await queryInterface.dropTable('report');
  },
};
