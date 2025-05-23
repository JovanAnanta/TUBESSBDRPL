import { Nasabah } from '../models/Nasabah';
import { Tagihan } from '../models/Tagihan';
import { Transaksi } from '../models/Transaksi';

export const bayarTagihan = async (
    nasabah_id: string,
    statusTagihanType: 'AIR' | 'LISTRIK',
    nomorTagihan: string,
    jumlahBayar: number
) => {
    try {
        const nasabah = await Nasabah.findByPk(nasabah_id);
        if (!nasabah) throw new Error('Nasabah tidak ditemukan');
        if (nasabah.saldo < jumlahBayar) throw new Error('Saldo tidak mencukupi');

        // Create tagihan record
        const tagihan = await Tagihan.create({
            statusTagihanType,
            nomorTagihan,
            jumlahSaldoBerkurang: jumlahBayar
        });

        // Update saldo nasabah
        nasabah.saldo -= jumlahBayar;
        await nasabah.save();

        // Create transaction record
        await Transaksi.create({
            nasabah_id,
            transaksiType: 'KELUAR',
            statusType: 'BERHASIL',
            tanggalTransaksi: new Date()
        });

        return { status: 'success', message: `Pembayaran tagihan ${statusTagihanType} berhasil` };
    } catch (error) {
        throw error;
    }
};

export const getRiwayatTagihan = async (nasabah_id: string) => {
    const transaksi = await Transaksi.findAll({
        where: { nasabah_id },
        order: [['tanggalTransaksi', 'DESC']]
    });
    return transaksi;
};