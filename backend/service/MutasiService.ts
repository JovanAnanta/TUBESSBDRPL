import { Transaksi } from '../models/Transaksi';
import { Nasabah } from '../models/Nasabah';
import { Transfer } from '../models/Transfer';
import { Credit } from '../models/Credit';
import { Debit } from '../models/Debit';
import { Tagihan } from '../models/Tagihan';
import { Pinjaman } from '../models/Pinjaman';
import { decrypt } from '../enkripsi/Encryptor';
import { Op, fn, col, where as seqWhere } from 'sequelize';

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
    _limit?: number,
    _offset?: number,
    startDate?: Date,
    endDate?: Date
): Promise<{ transactions: MutasiData[]; totalCount: number }> => {
    try {
        const nasabah = await Nasabah.findOne({ where: { nasabah_id: nasabahId } });
        if (!nasabah) throw new Error('Nasabah tidak ditemukan');

        // Filter by nasabah_id and optional date range on date part only
        let whereCondition: any;
        if (startDate && endDate) {
            const sd = (new Date(startDate)).toISOString().split('T')[0];
            const ed = (new Date(endDate)).toISOString().split('T')[0];
            // Filter records where DATE(tanggalTransaksi) between sd and ed
            whereCondition = {
                nasabah_id: nasabahId,
                [Op.and]: [
                    seqWhere(fn('DATE', col('tanggalTransaksi')), {
                        [Op.between]: [sd, ed]
                    })
                ]
            };
        } else {
            whereCondition = { nasabah_id: nasabahId };
        }        const transaksis = await Transaksi.findAll({
            where: whereCondition,
            include: [
                { model: Credit, required: false },
                { model: Debit, required: false },
                { model: Transfer, required: false },
                { model: Tagihan, required: false },
                { model: Pinjaman, required: false }
            ],
            order: [['tanggalTransaksi', 'DESC']],
            limit: _limit,
            offset: _offset
        });

        // Filter transaksi yang memiliki credit atau debit
        const validTransaksis = transaksis.filter((trx) => {
            const credit = (trx as any).Credit as Credit | null;
            const debit = (trx as any).Debit as Debit | null;
            
            // Hanya tampilkan transaksi yang memiliki entri di tabel Credit atau Debit
            return credit !== null || debit !== null;
        });        
        const transactions = validTransaksis.map((trx) => {
            const credit = (trx as any).Credit as Credit | null;
            const debit = (trx as any).Debit as Debit | null;
            const transfer = (trx as any).Transfer as Transfer | null;
            const tagihan = (trx as any).Tagihan as any;
            const pinjaman = (trx as any).Pinjaman as any;

            let nominal = 0;
            // Gunakan langsung keterangan dari objek Transaksi jika sudah ada
            let keterangan = trx.keterangan || ''; // Asumsi 'keterangan' ada di model Transaksi

            if (trx.transaksiType === 'MASUK') {
                if (credit) {
                    nominal = credit.jumlahSaldoBertambah;
                } else {
                    nominal = 0; // Fallback jika tidak ada credit
                }
            } else { // KELUAR
                if (debit) {
                    nominal = debit.jumlahSaldoBerkurang;
                } else {
                    nominal = 0; // Fallback jika tidak ada debit
                }
            }
            
            // Jika Anda ingin tetap menambahkan detail seperti masking nomor rekening,
            // Anda bisa menambahkannya HANYA JIKA keterangan dari DB belum cukup detail.
            // Contoh:
            if (keterangan === 'TRANSFER KELUAR' && transfer && transfer.toRekening) {
                try {
                    const toAccount = decrypt(transfer.toRekening);
                    const maskedToAccount = toAccount.slice(0, 4) + '****' + toAccount.slice(-4);
                    keterangan = `TRANSFER KELUAR ke ${maskedToAccount}`;
                } catch (error) {
                    // Jika dekripsi gagal, tetap gunakan keterangan asli
                    keterangan = 'TRANSFER KELUAR'; 
                }
            } else if (keterangan === 'TRANSFER MASUK' && transfer && transfer.fromRekening) {
                try {
                    const fromAccount = decrypt(transfer.fromRekening);
                    const maskedFromAccount = fromAccount.slice(0, 4) + '****' + fromAccount.slice(-4);
                    keterangan = `TRANSFER MASUK dari ${maskedFromAccount}`;
                } catch (error) {
                    // Jika dekripsi gagal, tetap gunakan keterangan asli
                    keterangan = 'TRANSFER MASUK';
                }
            }
            // Logika untuk Tagihan dan Pinjaman juga bisa disesuaikan
            else if (tagihan && debit) {
                keterangan = `PEMBAYARAN ${tagihan.statusTagihanType} - ${tagihan.nomorTagihan}`;
            } else if (pinjaman && debit) {
                keterangan = `PINJAMAN ${pinjaman.statusJatuhTempo} - ${pinjaman.jumlahPerBulan?.toLocaleString('id-ID') || ''}`;
            }


            let saldoSetelahTransaksi = nasabah.saldo;
            
            return {
                transaksi_id: trx.transaksi_id,
                tanggalTransaksi: trx.tanggalTransaksi,
                transaksiType: trx.transaksiType as 'MASUK' | 'KELUAR',
                nominal,
                keterangan, // Gunakan keterangan yang sudah diolah atau dari DB
                saldoSetelahTransaksi
            };
        });

        return { transactions, totalCount: transactions.length };
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
