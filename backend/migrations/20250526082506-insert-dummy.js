import { v4 as uuidv4 } from "uuid";

export async function up(queryInterface, Sequelize) {
  const nasabahId = "006b8ce5-46a0-4057-8e96-4b87a4e7fd2e";
  const transaksiAirId = uuidv4();
  const transaksiListrikId = uuidv4();

  await queryInterface.bulkInsert('transaksi', [
    {
      transaksi_id: transaksiAirId,
      nasabah_id: nasabahId,
      transaksiType: 'KELUAR',
      tanggalTransaksi: new Date('2024-05-01'),
      keterangan: 'TAGIHAN AIR',
    },
    {
      transaksi_id: transaksiListrikId,
      nasabah_id: nasabahId,
      transaksiType: 'KELUAR',
      tanggalTransaksi: new Date('2024-05-10'),
      keterangan: 'TAGIHAN LISTRIK',
    }
  ], {});

  await queryInterface.bulkInsert('tagihan', [
    {
      tagihan_id: uuidv4(),
      transaksi_id: transaksiAirId,
      statusTagihanType: 'AIR',
      nomorTagihan: 'PDAM123456',
    },
    {
      tagihan_id: uuidv4(),
      transaksi_id: transaksiListrikId,
      statusTagihanType: 'LISTRIK',
      nomorTagihan: 'PLN789012',
    }
  ], {});

  await queryInterface.bulkInsert('debit', [
    {
      debit_id: uuidv4(),
      transaksi_id: transaksiAirId,
      jumlahSaldoBerkurang: 150000,
    },
    {
      debit_id: uuidv4(),
      transaksi_id: transaksiListrikId,
      jumlahSaldoBerkurang: 200000,
    }
  ], {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('debit', null, {});
  await queryInterface.bulkDelete('tagihan', null, {});
  await queryInterface.bulkDelete('transaksi', null, {});
}
