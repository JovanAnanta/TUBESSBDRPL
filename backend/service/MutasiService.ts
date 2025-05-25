import { Transaksi } from '../models/Transaksi';
import { Nasabah } from '../models/Nasabah';
import { Transfer } from '../models/Transfer';
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
    limit: number = 20, 
    offset: number = 0,
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
            whereCondition.tanggalTransaksi = {
                [Op.between]: [startDate, endDate]
            };
        } else if (startDate) {
            whereCondition.tanggalTransaksi = {
                [Op.gte]: startDate
            };
        } else if (endDate) {
            whereCondition.tanggalTransaksi = {
                [Op.lte]: endDate
            };
        }

        // Get total count untuk pagination
        const totalCount = await Transaksi.count({ where: whereCondition });

        // Get transaksi dengan pagination
        const transaksis = await Transaksi.findAll({
            where: whereCondition,
            order: [['tanggalTransaksi', 'DESC']],
            limit,
            offset,
            include: [
                {
                    model: Transfer,
                    required: false,
                    attributes: ['noRekening']
                }
            ]
        });

        // Transform data untuk response
        const transactions: MutasiData[] = await Promise.all(
            transaksis.map(async (transaksi, index) => {
                // Simulasi nominal dan keterangan berdasarkan type
                // Dalam implementasi nyata, ini harus dari tabel yang sesuai
                const nominal = transaksi.transaksiType === 'MASUK' 
                    ? Math.floor(Math.random() * 1000000) + 100000 
                    : Math.floor(Math.random() * 500000) + 50000;

                let keterangan = '';
                if (transaksi.transaksiType === 'MASUK') {
                    keterangan = 'Transfer Masuk';
                } else {
                    keterangan = 'Transfer Keluar';
                }

                // Simulasi saldo setelah transaksi
                // Dalam implementasi nyata, ini harus disimpan atau dihitung dari riwayat
                const saldoSetelahTransaksi = nasabah.saldo + (index * 10000);

                return {
                    transaksi_id: transaksi.transaksi_id,
                    tanggalTransaksi: transaksi.tanggalTransaksi,
                    transaksiType: transaksi.transaksiType as 'MASUK' | 'KELUAR',
                    nominal,
                    keterangan,
                    saldoSetelahTransaksi
                };
            })
        );

        return {
            transactions,
            totalCount
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
