import { Debit } from '../models/Debit';
import { Nasabah } from '../models/Nasabah';
import { Tagihan } from '../models/Tagihan';
import { Transaksi } from '../models/Transaksi';

const validTypes = ['AIR', 'LISTRIK'];

export const bayarTagihan = async (
    nasabah_id: string,
    statusTagihanType: string,
    nomorTagihan: string,
    jumlahBayar: number
) => {
    if (!validTypes.includes(statusTagihanType)) {
        throw new Error('Tipe tagihan tidak valid');
    }

    const nasabah = await Nasabah.findByPk(nasabah_id);
    if (!nasabah) throw new Error('Nasabah tidak ditemukan');
    if (nasabah.saldo < jumlahBayar) throw new Error('Saldo tidak mencukupi');

    // Create tagihan record (no jumlahSaldoBerkurang here)
    const tagihan = await Tagihan.create({
        statusTagihanType,
        nomorTagihan,
    });

    // Update saldo nasabah
    nasabah.saldo -= jumlahBayar;
    await nasabah.save();

    // Create transaksi record
    const transaksi = await Transaksi.create({
        nasabah_id,
        transaksiType: 'KELUAR',
        statusType: 'BERHASIL',
        tanggalTransaksi: new Date()
    });

    // Create debit record linked to transaksi with jumlahSaldoBerkurang
    await Debit.create({
        transaksi_id: transaksi.id || transaksi.getDataValue('id') || transaksi.get('id'),
        jumlahSaldoBerkurang: jumlahBayar
    });

    return { status: 'success', message: `Pembayaran tagihan ${statusTagihanType} berhasil` };
};

export const getRiwayatTagihan = async (nasabah_id: string) => {
    const transaksi = await Transaksi.findAll({
        where: { nasabah_id },
        order: [['tanggalTransaksi', 'DESC']]
    });
    return transaksi;
};
