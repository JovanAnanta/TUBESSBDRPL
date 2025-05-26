import { v4 as uuidv4 } from "uuid";

export async function up(queryInterface, Sequelize) {
  const nasabahId = "439845cc-1c79-42a8-ae4b-797b576354ba";
  const transaksiAirId = uuidv4();
  const transaksiAirId2 = uuidv4();
  const transaksiListrikId = uuidv4();
  const transaksiListrikId2 = uuidv4();

  await queryInterface.bulkInsert('transaksi', [
    {
      transaksi_id: transaksiAirId,
      nasabah_id: nasabahId,
      transaksiType: 'KELUAR',
      tanggalTransaksi: new Date('2024-05-01'),
      keterangan: 'TAGIHAN AIR',
    },
    {
      transaksi_id: transaksiAirId2,
      nasabah_id: nasabahId,
      transaksiType: 'KELUAR',
      tanggalTransaksi: new Date('2024-05-02'),
      keterangan: 'TAGIHAN AIR',
    },
    {
      transaksi_id: transaksiListrikId,
      nasabah_id: nasabahId,
      transaksiType: 'KELUAR',
      tanggalTransaksi: new Date('2024-05-10'),
      keterangan: 'TAGIHAN LISTRIK',
    },
    {
      transaksi_id: transaksiListrikId2,
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
      transaksi_id: transaksiAirId2,
      statusTagihanType: 'AIR',
      nomorTagihan: 'PDAM111111',
    },
    {
      tagihan_id: uuidv4(),
      transaksi_id: transaksiListrikId,
      statusTagihanType: 'LISTRIK',
      nomorTagihan: 'PLN789012',
    },
    {
      tagihan_id: uuidv4(),
      transaksi_id: transaksiListrikId2,
      statusTagihanType: 'LISTRIK',
      nomorTagihan: 'PLN888888',
    }
  ], {});

  // Remove the debit for transaksiAirId2 so we can pay it later
  await queryInterface.bulkInsert('debit', [
    {
      debit_id: uuidv4(),
      transaksi_id: transaksiAirId,
      jumlahSaldoBerkurang: 150000,
    },
    // No debit for transaksiAirId2 - this is the unpaid bill
    {
      debit_id: uuidv4(),
      transaksi_id: transaksiListrikId,
      jumlahSaldoBerkurang: 200000,
    }
  ], {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('debit', {}, {});
  await queryInterface.bulkDelete('tagihan', {}, {});
  await queryInterface.bulkDelete('transaksi', {}, {});
}