import { Pinjaman } from "../models/Pinjaman";
import { Transaksi } from "../models/Transaksi";
import { encrypt, decrypt } from "../enkripsi/Encryptor";
import moment from "moment";
import { TagihanPinjaman } from "../models/TagihanPinjaman";
import { Nasabah } from "../models/Nasabah";
import { Debit } from "../models/Debit";

// ✅ 1. AJUKAN PINJAMAN
export const ajukanPinjamanService = async (
  nasabah_id: string,
  jumlahPinjaman: number,
  statusJatuhTempo: "6BULAN" | "12BULAN" | "24BULAN"
) => {
  const transaksi = await Transaksi.create({
    nasabah_id,
    transaksiType: "MASUK", // ✅ benar
    tanggalTransaksi: new Date(),
    keterangan: "PINJAMAN"     // ✅ ditambahkan
  });

  const bulan =
    statusJatuhTempo === "6BULAN" ? 6 :
    statusJatuhTempo === "12BULAN" ? 12 : 24;

  const pinjaman = await Pinjaman.create({
    transaksi_id: transaksi.transaksi_id,
    jumlahPinjaman,
    statusJatuhTempo,
    tanggalJatuhTempo: moment().add(bulan, 'months').toDate(),
    statusPinjaman: "PENDING"
  });

  return pinjaman;
};

// ✅ 2. GET TAGIHAN USER
export const getTagihanPinjamanByUser = async (nasabah_id: string) => {
  const transaksiPinjaman = await Transaksi.findAll({
    where: {
      nasabah_id,
      transaksiType: "MASUK",
      keterangan: "PINJAMAN"
    }
  });

  const transaksiIds = transaksiPinjaman.map(tx => tx.transaksi_id);

  const pinjamans = await Pinjaman.findAll({
    where: {
      transaksi_id: transaksiIds
    }
  });

  const pinjamanIds = pinjamans.map(p => p.pinjaman_id);

  const tagihanList = await TagihanPinjaman.findAll({
    where: {
      pinjaman_id: pinjamanIds
    },
    order: [['tanggalTagihan', 'ASC']]
  });

  return tagihanList;
};

// ✅ 3. BAYAR TAGIHAN
export const bayarTagihanPinjaman = async (tagihan_id: string, nasabah_id: string) => {
  const tagihan = await TagihanPinjaman.findByPk(tagihan_id);
  if (!tagihan) throw new Error("Tagihan tidak ditemukan");
  if (tagihan.status === "LUNAS") throw new Error("Tagihan sudah dibayar");

  // ✅ Ambil data pinjaman terkait tagihan
  const pinjaman = await Pinjaman.findOne({
    where: { pinjaman_id: tagihan.pinjaman_id }
  });
  if (!pinjaman) throw new Error("Data pinjaman tidak ditemukan");

  // ✅ Ambil nasabah dan cek apakah sudah klaim pinjaman
  const nasabah = await Nasabah.findByPk(nasabah_id);
  if (!nasabah) throw new Error("Nasabah tidak ditemukan");

  // Cek apakah nasabah sudah klaim pinjaman (buktinya saldo sudah bertambah)
  const sudahKlaim = nasabah.saldo >= pinjaman.jumlahPinjaman;
  if (!sudahKlaim) {
    throw new Error("Anda belum mengklaim pinjaman. Silakan klaim terlebih dahulu.");
  }

  // ✅ Cek saldo cukup untuk bayar tagihan
  if (nasabah.saldo < tagihan.jumlahTagihan) {
    throw new Error("Saldo tidak mencukupi untuk membayar tagihan");
  }

  // Kurangi saldo
  nasabah.saldo -= tagihan.jumlahTagihan;
  await nasabah.save();

  // Buat transaksi
  const transaksi = await Transaksi.create({
    nasabah_id,
    transaksiType: "KELUAR",
    tanggalTransaksi: new Date(),
    keterangan: "PINJAMAN"
  });

  // Buat debit
  await Debit.create({
    debit_id: transaksi.transaksi_id,
    transaksi_id: transaksi.transaksi_id,
    jumlahSaldoBerkurang: tagihan.jumlahTagihan
  });

  // Update status tagihan
  tagihan.status = "LUNAS";
  await tagihan.save();

  return { transaksi, tagihan };
};

export const claimPinjamanService = async (nasabah_id: string, pinjaman_id: string) => {
  const pinjaman = await Pinjaman.findOne({ where: { pinjaman_id } });
  if (!pinjaman) throw new Error("Pinjaman tidak ditemukan");
  if (pinjaman.statusPinjaman !== "ACCEPTED") throw new Error("Pinjaman belum disetujui");

  // ✅ Cek apakah saldo sudah pernah diklaim (indikasi: tagihan SUDAH ADA dan nasabah sudah menerima saldo)
  const existingTagihan = await TagihanPinjaman.findOne({ where: { pinjaman_id } });
  if (!existingTagihan) throw new Error("Tagihan belum dibuat. Tunggu admin menyetujui pinjaman.");

  const nasabah = await Nasabah.findByPk(nasabah_id);
  if (!nasabah) throw new Error("Nasabah tidak ditemukan");

  // ✅ Tambahan proteksi: jika saldo nasabah sudah naik karena pinjaman, jangan proses ulang
  const hasClaimed = existingTagihan.createdAt && existingTagihan.createdAt < new Date();
  const saldoSesudahClaim = pinjaman.jumlahPinjaman + 1; // Tambahkan ambang batas

  if (nasabah.saldo >= saldoSesudahClaim) {
    throw new Error("Pinjaman ini sudah pernah diclaim sebelumnya.");
  }

  // ✅ Tambahkan saldo ke nasabah
  nasabah.saldo += pinjaman.jumlahPinjaman;
  await nasabah.save();

  return { message: "Claim berhasil! Saldo Anda telah bertambah." };
};

export const getPinjamanStatusService = async (nasabah_id: string) => {
  const transaksi = await Transaksi.findOne({
    where: { nasabah_id, keterangan: "PINJAMAN" },
    order: [["tanggalTransaksi", "DESC"]]
  });

  if (!transaksi) return null;

  const pinjaman = await Pinjaman.findOne({
    where: { transaksi_id: transaksi.transaksi_id }
  });

  if (!pinjaman) return null;

const nasabah = await Nasabah.findByPk(nasabah_id);
const claimed = nasabah ? nasabah.saldo >= pinjaman.jumlahPinjaman : false;

return {
  pinjaman_id: pinjaman.pinjaman_id,
  jumlahPinjaman: pinjaman.jumlahPinjaman,
  statusJatuhTempo: pinjaman.statusJatuhTempo,
  statusPinjaman: pinjaman.statusPinjaman,
  claimed
};
};
