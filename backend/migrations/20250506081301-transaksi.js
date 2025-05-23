"use strict";

/** @type {import('sequelize-cli').Migration} */
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
          model: 'nasabah',
          key: 'nasabah_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      transaksiType: {
        type: sequelize.ENUM('MASUK', 'KELUAR'),
        allowNull: false,
      },
      tanggalTransaksi: {
        type: sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, sequelize) => {
    // Bungkus removeConstraint dengan try/catch agar jika tabel tidak ada, rollback tetap dilanjutkan.
    try {
      await queryInterface.removeConstraint('transfer', '20250523195342-transfer');
    } catch (error) {
      console.warn('Tidak dapat menghapus constraint pada tabel transfer:', error.message);
    }
    try {
      await queryInterface.removeConstraint('tagihan', 'tagihan_20250506081257');
    } catch (error) {
      console.warn('Tidak dapat menghapus constraint pada tabel tagihan:', error.message);
    }
    try {
      await queryInterface.removeConstraint('pinjaman', 'pinjaman_20250506081238');
    } catch (error) {
      console.warn('Tidak dapat menghapus constraint pada tabel pinjaman:', error.message);
    }
    try {
      await queryInterface.removeConstraint('debit', 'debit_20250506081218');
    } catch (error) {
      console.warn('Tidak dapat menghapus constraint pada tabel debit:', error.message);
    }
    try {
      await queryInterface.removeConstraint('credit', 'credit_20250506081212');
    } catch (error) {
      console.warn('Tidak dapat menghapus constraint pada tabel credit:', error.message);
    }

    await queryInterface.dropTable('transaksi');
  },
};