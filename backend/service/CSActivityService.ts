import { LoginActivity } from "../models/LoginActivity";
import { Transaksi } from "../models/Transaksi";
import { Debit } from "../models/Debit";
import { Credit } from "../models/Credit";
import { Transfer } from "../models/Transfer";
import { Tagihan } from "../models/Tagihan";
import { Pinjaman } from "../models/Pinjaman";
import { Nasabah } from "../models/Nasabah";
import { decrypt } from "../enkripsi/Encryptor";
import { Op } from 'sequelize';

export interface TransactionData {
  transaksi_id: string;
  tanggal: string;
  tipe: string;
  jumlah: number;
  keterangan: string;
  status?: string;
  // Include time for UI representation
  waktu?: string;
}

export const getLoginActivityByNasabah = async (nasabahId: string, startDate?: Date, endDate?: Date) => {
  try {
    // Build where condition
    const whereCondition: any = { nasabah_id: nasabahId };
    
    if (startDate || endDate) {
      const range: any = {};
      if (startDate) range[Op.gte] = startDate;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        range[Op.lte] = endOfDay;
      }
      whereCondition.waktu_login = range;
    }
    
    const logins = await LoginActivity.findAll({
      where: whereCondition,
      order: [["waktu_login", "DESC"]],
    });

    return logins;
  } catch (error) {
    console.error("Error in getLoginActivityByNasabah:", error);
    throw new Error("Failed to retrieve login activity");
  }
};

export const getAllTransaksiByNasabah = async (
  nasabahId: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 1000,
  offset: number = 0
) => {
  try {
    const nasabah = await Nasabah.findOne({ where: { nasabah_id: nasabahId } });
    if (!nasabah) throw new Error('Nasabah tidak ditemukan');

    // Build where condition
    const whereCondition: any = { nasabah_id: nasabahId };
    
    if (startDate || endDate) {
      const range: any = {};
      if (startDate) range[Op.gte] = startDate;
      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        range[Op.lte] = endOfDay;
      }
      whereCondition.tanggalTransaksi = range;
    }
    
    // Count total results without limit for pagination
    const totalCount = await Transaksi.count({ where: whereCondition });
    
    const transaksi = await Transaksi.findAll({
      where: whereCondition,
      include: [
        { model: Debit, required: false },
        { model: Credit, required: false },
        { model: Transfer, required: false },
        { model: Tagihan, required: false },
        { model: Pinjaman, required: false }
      ],
      order: [['tanggalTransaksi', 'DESC']],
      limit: limit,
      offset: offset
    });

    return { transactions: transaksi, totalCount };
  } catch (error) {
    console.error("Error in getAllTransaksiByNasabah:", error);
    throw new Error("Failed to retrieve transaction data");
  }
};

export const formatTransaksiData = (transaksiList: Transaksi[]): TransactionData[] => {
  return transaksiList.map(trx => {
    let tipe = trx.transaksiType; // Default to MASUK or KELUAR
    let jumlah = 0;
    let keterangan = trx.keterangan || '';
    
    const debit = (trx as any).Debit;
    const credit = (trx as any).Credit;
    const transfer = (trx as any).Transfer;
    const tagihan = (trx as any).Tagihan;
    const pinjaman = (trx as any).Pinjaman;

    // Format datetime for display
    const dateObj = new Date(trx.tanggalTransaksi);
    const formattedDate = dateObj.toISOString().split('T')[0];
    const formattedTime = dateObj.toTimeString().slice(0, 8); // HH:MM:SS format

    // Determine transaction type and amount based on standardized types
    if (trx.transaksiType === 'MASUK') {
      if (credit) {
        jumlah = credit.jumlahSaldoBertambah;
        
        if (transfer && transfer.fromRekening) {
          try {
            const fromAccount = decrypt(transfer.fromRekening);
            const maskedFromAccount = fromAccount.slice(0, 4) + '****' + fromAccount.slice(-4);
            keterangan = `TRANSFER MASUK dari ${maskedFromAccount}`;
          } catch (error) {
            keterangan = 'TRANSFER MASUK';
          }
        } else {
          keterangan = 'TOP UP';
        }
      }
    } else { // KELUAR
      if (debit) {
        jumlah = debit.jumlahSaldoBerkurang;
        
        if (transfer) {
          try {
            if (transfer.toRekening) {
              const toAccount = decrypt(transfer.toRekening);
              const maskedToAccount = toAccount.slice(0, 4) + '****' + toAccount.slice(-4);
              keterangan = `TRANSFER KELUAR ke ${maskedToAccount}`;
            } else {
              keterangan = 'TRANSFER KELUAR';
            }
          } catch (error) {
            keterangan = 'TRANSFER KELUAR';
          }
        } else if (tagihan) {
          if (tagihan.statusTagihanType === 'AIR') {
            keterangan = `TAGIHAN AIR - ${tagihan.nomorTagihan}`;
          } else if (tagihan.statusTagihanType === 'LISTRIK') {
            keterangan = `TAGIHAN LISTRIK - ${tagihan.nomorTagihan}`;
          } else {
            keterangan = `TAGIHAN ${tagihan.statusTagihanType} - ${tagihan.nomorTagihan}`;
          }
        } else if (pinjaman) {
          keterangan = `PINJAMAN`;
          
          if (pinjaman.statusJatuhTempo) {
            keterangan += ` ${pinjaman.statusJatuhTempo}`;
          }
          
          if (pinjaman.statusPinjaman) {
            keterangan += ` (${pinjaman.statusPinjaman})`;
          }
        } else {
          // Default for debit without specifics
          keterangan = keterangan || 'Penarikan saldo';
        }
      }
    }
    
    return {
      transaksi_id: trx.transaksi_id,
      tanggal: formattedDate,
      waktu: formattedTime,
      tipe: trx.transaksiType, // Use MASUK or KELUAR consistently
      jumlah,
      keterangan,
      status: pinjaman?.statusPinjaman || undefined
    };
  });
};

export const getTransaksiByDateRange = async (
  nasabahId: string,
  startDate: Date,
  endDate: Date
): Promise<TransactionData[]> => {
  try {
    const result = await getAllTransaksiByNasabah(nasabahId, startDate, endDate);
    return formatTransaksiData(result.transactions);
  } catch (error) {
    console.error('Error in getTransaksiByDateRange:', error);
    throw new Error('Failed to retrieve transactions by date range');
  }
};

export const getLastTransactions = async (
  nasabahId: string, 
  count: number = 5
): Promise<TransactionData[]> => {
  try {
    const result = await getAllTransaksiByNasabah(nasabahId, undefined, undefined, count, 0);
    return formatTransaksiData(result.transactions);
  } catch (error) {
    console.error('Error in getLastTransactions:', error);
    throw new Error('Failed to retrieve last transactions');
  }
};
