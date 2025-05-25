import { Transaksi } from '../models/Transaksi';
import { Nasabah } from '../models/Nasabah';
import { Transfer } from '../models/Transfer';
import { Credit } from '../models/Credit';
import { Debit } from '../models/Debit';
import { Tagihan } from '../models/Tagihan';
import { Pinjaman } from '../models/Pinjaman';
import { decrypt } from '../enkripsi/Encryptor';
import { Op } from 'sequelize';

export interface MutasiData {
    transaksi_id: string;
    tanggalTransaksi: Date;
    transaksiType: 'MASUK' | 'KELUAR';
    nominal: number;
    keterangan: string;
    saldoSetelahTransaksi: number;
}

export interface SaldoInfo {
    nasabah_id: string;
    nama: string;
    noRekening: string;
    saldo: number;
    lastUpdate: Date;
}

export const getSaldoInfo = async (nasabahId: string): Promise<SaldoInfo | null> => {
    try {
        const nasabah = await Nasabah.findOne({ 
            where: { nasabah_id: nasabahId },
            attributes: ['nasabah_id', 'nama', 'noRekening', 'saldo', 'createdAt']
        });

        if (!nasabah) {
            return null;
        }

        return {
            nasabah_id: nasabah.nasabah_id,
            nama: decrypt(nasabah.nama),
            noRekening: decrypt(nasabah.noRekening),
            saldo: nasabah.saldo,
            lastUpdate: nasabah.createdAt
        };
    } catch (error) {
        console.error('Error in getSaldoInfo:', error);
        throw new Error('Gagal mengambil informasi saldo');
    }
};

export const getMutasiRekening = async (
    nasabahId: string,
    // limit and offset no longer used, kept for signature compatibility
    _limit?: number,
    _offset?: number,
    startDate?: Date,
    endDate?: Date
): Promise<{ transactions: MutasiData[]; totalCount: number }> => {
    try {
        // Validasi nasabah
        const nasabah = await Nasabah.findOne({ where: { nasabah_id: nasabahId } });
        if (!nasabah) {
            throw new Error('Nasabah tidak ditemukan');
        }

        // Build filter kondisi
        const whereCondition: any = { nasabah_id: nasabahId };
        
        if (startDate && endDate) {
            // include full endDate day
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            whereCondition.tanggalTransaksi = {
                [Op.between]: [startDate, endOfDay]
            };
        } else if (startDate) {
            whereCondition.tanggalTransaksi = {
                [Op.gte]: startDate
            };
        } else if (endDate) {
            // include full endDate day
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            whereCondition.tanggalTransaksi = {
                [Op.lte]: endOfDay
            };
        }

        // Fetch all transactions in date range (ignore pagination)
        const transaksis = await Transaksi.findAll({
            where: whereCondition,
            order: [['tanggalTransaksi', 'DESC']]
        });

        // Map each transaction to MutasiData by querying related tables
        const mapped = await Promise.all(
            transaksis.map(async (trx, index) => {
                const credit = await Credit.findOne({ where: { transaksi_id: trx.transaksi_id } }) as Credit | null;
                const debit = await Debit.findOne({ where: { transaksi_id: trx.transaksi_id } }) as Debit | null;
                const transfer = await Transfer.findOne({ where: { transaksi_id: trx.transaksi_id } }) as Transfer | null;
                const tagihan = await Tagihan.findOne({ where: { transaksi_id: trx.transaksi_id } }) as Tagihan | null;
                const pinjaman = await Pinjaman.findOne({ where: { transaksi_id: trx.transaksi_id } }) as Pinjaman | null;

                let nominal = 0;
                let keterangan = '';
                // Prioritas dengan cek transaksiType: outgoing/incoming transfer, top-up, tagihan, pinjaman
                if (trx.transaksiType === 'MASUK' && transfer && credit && credit.jumlahSaldoBertambah > 0) {
                    nominal = credit.jumlahSaldoBertambah;
                    keterangan = 'Transfer Masuk';
                } else if (trx.transaksiType === 'KELUAR' && transfer && debit && debit.jumlahSaldoBerkurang > 0) {
                    nominal = debit.jumlahSaldoBerkurang;
                    keterangan = 'Transfer Keluar';
                } else if (credit && credit.jumlahSaldoBertambah > 0) {
                    nominal = credit.jumlahSaldoBertambah;
                    keterangan = 'Top-up';
                } else if (tagihan && debit) {
                    nominal = debit.jumlahSaldoBerkurang;
                    keterangan = `Tagihan ${tagihan.statusTagihanType}`;
                } else if (pinjaman && debit) {
                    nominal = debit.jumlahSaldoBerkurang;
                    keterangan = `Pinjaman ${pinjaman.statusJatuhTempo}`;
                } else {
                    nominal = 0;
                    keterangan = trx.transaksiType === 'MASUK' ? 'Masuk' : 'Keluar';
                }

                // Simulasi saldo setelah transaksi (ganti sesuai kebutuhan)
                const saldoSetelahTransaksi = nasabah.saldo + index * 10000;

                return {
                    transaksi_id: trx.transaksi_id,
                    tanggalTransaksi: trx.tanggalTransaksi,
                    transaksiType: trx.transaksiType as 'MASUK' | 'KELUAR',
                    nominal,
                    keterangan,
                    saldoSetelahTransaksi
                };
            })
        );

        return {
            transactions: mapped,
            totalCount: mapped.length
        };
    } catch (error) {
        console.error('Error in getMutasiRekening:', error);
        throw new Error('Gagal mengambil mutasi rekening');
    }
};

export const getMutasiByDateRange = async (
    nasabahId: string,
    startDate: Date,
    endDate: Date
): Promise<MutasiData[]> => {
    try {
        const result = await getMutasiRekening(nasabahId, 1000, 0, startDate, endDate);
        return result.transactions;
    } catch (error) {
        console.error('Error in getMutasiByDateRange:', error);
        throw new Error('Gagal mengambil mutasi berdasarkan tanggal');
    }
};

export const getLastTransactions = async (
    nasabahId: string, 
    count: number = 5
): Promise<MutasiData[]> => {
    try {
        const result = await getMutasiRekening(nasabahId, count, 0);
        return result.transactions;
    } catch (error) {
        console.error('Error in getLastTransactions:', error);
        throw new Error('Gagal mengambil transaksi terakhir');
    }
};
