import { LoginActivity } from "../models/LoginActivity";
import { Transaksi } from "../models/Transaksi";
import { Debit } from "../models/Debit";
import { Credit } from "../models/Credit";
import { Transfer } from "../models/Transfer";
import { Tagihan } from "../models/Tagihan";
import { Pinjaman } from "../models/Pinjaman";

export const getLoginActivityByNasabah = async (nasabahId: string) => {
  const logins = await LoginActivity.findAll({
    where: { nasabah_id: nasabahId },
    order: [["waktu_login", "DESC"]],
  });

  return logins;
};

export const getAllTransaksiByNasabah = async (nasabahId: string) => {
  const transaksi = await Transaksi.findAll({
    where: { nasabah_id: nasabahId },
    include: [Debit, Credit, Transfer, Tagihan, Pinjaman],
    order: [['tanggalTransaksi', 'DESC']],
  });

  return transaksi;
};

export const formatTransaksiData = (transaksiList: Transaksi[]) => {
  return (transaksiList as any[]).map(trx => {
    let tipe = '';
    let jumlah = 0;
    let keterangan = '';

    if (trx.Debit) {
      tipe = trx.Transfer ? 'TRANSFER' : 'DEBIT';
      jumlah = trx.Debit.jumlahSaldoBerkurang;
      keterangan = trx.Transfer
        ? `Transfer ke rekening ${trx.Transfer.noRekening}`
        : 'Penarikan saldo';
    } else if (trx.Credit) {
      tipe = 'TOPUP';
      jumlah = trx.Credit.jumlahSaldoBertambah;
      keterangan = 'Top-up saldo';
    } else if (trx.Tagihan) {
      tipe = 'TAGIHAN';
      jumlah = trx.Debit?.jumlahSaldoBerkurang || 0;
      keterangan = `Bayar tagihan ${trx.Tagihan.statusTagihanType} ${trx.Tagihan.nomorTagihan}`;
    } else if (trx.Pinjaman) {
      tipe = 'PINJAMAN';
      jumlah = trx.Pinjaman.jumlahPerBulan;
      keterangan = `Pinjaman tenor ${trx.Pinjaman.statusJatuhTempo}`;
    }

    return {
      tanggal: trx.tanggalTransaksi.toISOString().split('T')[0],
      tipe,
      jumlah,
      keterangan,
    };
  });
};
