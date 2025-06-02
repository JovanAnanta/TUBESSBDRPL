import { Pinjaman } from "../models/Pinjaman";
import { Transaksi } from "../models/Transaksi";
import { encrypt, decrypt } from "../enkripsi/Encryptor";
import moment from "moment";
import { TagihanPinjaman } from "../models/TagihanPinjaman";
import { Nasabah } from "../models/Nasabah";
import { Debit } from "../models/Debit";
import { Credit } from "../models/Credit";

// ✅ 1. AJUKAN PINJAMAN
export const ajukanPinjamanService = async (
  nasabah_id: string,
  jumlahPinjaman: number,
  statusJatuhTempo: "6BULAN" | "12BULAN" | "24BULAN"
) => {
  const transaksi = await Transaksi.create({
    nasabah_id,
    transaksiType: "MASUK",
    tanggalTransaksi: new Date(),
    keterangan: "PINJAMAN"
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

// ✅ 2. GET TAGIHAN USER (menggunakan relasi yang sudah ada)
export const getTagihanPinjamanByUser = async (nasabah_id: string) => {
  const tagihan = await TagihanPinjaman.findAll({
    include: [{
      model: Pinjaman,
      required: true,
      include: [{
        model: Transaksi,
        where: {
          nasabah_id,
          keterangan: "PINJAMAN",
          transaksiType: "MASUK"
        }
      }]
    }],
    order: [["tanggalTagihan", "ASC"]]
  });

  return tagihan;
};

// ✅ 3. BAYAR TAGIHAN (perbaiki dengan include yang konsisten)
export const bayarTagihanPinjaman = async (tagihan_id: string, nasabah_id: string) => {
  const tagihan = await TagihanPinjaman.findByPk(tagihan_id);
  if (!tagihan) throw new Error("Tagihan tidak ditemukan");
  if (tagihan.status === "LUNAS") throw new Error("Tagihan sudah dibayar");

  // Cek pinjaman terkait
  const pinjaman = await Pinjaman.findOne({
    where: { pinjaman_id: tagihan.pinjaman_id }
  });
  if (!pinjaman) throw new Error("Data pinjaman tidak ditemukan");

  const nasabah = await Nasabah.findByPk(nasabah_id);
  if (!nasabah) throw new Error("Nasabah tidak ditemukan");

  // ✅ Cek apakah pinjaman sudah diklaim
  const creditExists = await Credit.findOne({
    include: [{
      model: Transaksi,
      where: {
        nasabah_id: nasabah_id,
        transaksiType: "MASUK",
        keterangan: "PINJAMAN"
      }
    }],
    where: {
      jumlahSaldoBertambah: pinjaman.jumlahPinjaman
    }
  });

  if (!creditExists) {
    throw new Error("Anda belum mengklaim pinjaman. Silakan klaim terlebih dahulu.");
  }

  // ✅ Cek saldo cukup
  if (nasabah.saldo < tagihan.jumlahTagihan) {
    throw new Error("Saldo tidak mencukupi untuk membayar tagihan");
  }

  // Kurangi saldo
  nasabah.saldo -= tagihan.jumlahTagihan;
  await nasabah.save();

  // Buat transaksi pembayaran
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

// ✅ 4. CLAIM PINJAMAN (sama seperti sebelumnya)
export const claimPinjamanService = async (nasabah_id: string, pinjaman_id: string) => {
  const pinjaman = await Pinjaman.findOne({ 
    where: { pinjaman_id },
    include: [Transaksi] // ← penting untuk ambil nasabah_id dari relasi transaksi
  });

  if (!pinjaman) throw new Error("Pinjaman tidak ditemukan");
  if (pinjaman.statusPinjaman !== "ACCEPTED") throw new Error("Pinjaman belum disetujui");
  if (!pinjaman.transaksi) throw new Error("Transaksi pinjaman tidak ditemukan");

  // Cek apakah pinjaman sudah diklaim sebelumnya
  const existingCredit = await Credit.findOne({
    where: {
      transaksi_id: pinjaman.transaksi_id,
      jumlahSaldoBertambah: pinjaman.jumlahPinjaman
    }
  });

  if (existingCredit) {
    throw new Error("Pinjaman ini sudah diklaim sebelumnya.");
  }

  // Cek apakah transaksi milik nasabah yang sedang login
  if (pinjaman.transaksi.nasabah_id !== nasabah_id) {
    throw new Error("Anda tidak berhak mengklaim pinjaman ini.");
  }

  // Tambahkan saldo ke nasabah
  const nasabah = await Nasabah.findByPk(nasabah_id);
  if (!nasabah) throw new Error("Nasabah tidak ditemukan");

  nasabah.saldo += pinjaman.jumlahPinjaman;
  await nasabah.save();

  // Tambahkan Credit menggunakan transaksi yang sudah ada
  await Credit.create({
    credit_id: pinjaman.transaksi_id,
    transaksi_id: pinjaman.transaksi_id,
    jumlahSaldoBertambah: pinjaman.jumlahPinjaman
  });

  return {
    message: "Claim berhasil! Saldo Anda telah bertambah.",
    transaksi_id: pinjaman.transaksi_id,
    jumlahDiterima: pinjaman.jumlahPinjaman
  };
};


// ✅ 5. GET STATUS PINJAMAN (menggunakan relasi dan field yang ada)
export const getPinjamanStatusService = async (nasabah_id: string) => {
  const pinjaman = await Pinjaman.findOne({
    include: [{
      model: Transaksi,
      where: {
        nasabah_id: nasabah_id,
        keterangan: "PINJAMAN",
        transaksiType: "MASUK"
      }
    }],
    order: [["tanggalJatuhTempo", "DESC"]] // ✅ Gunakan tanggalJatuhTempo karena timestamps: false
  });

  if (!pinjaman) {
    console.log(`No pinjaman found for nasabah: ${nasabah_id}`);
    return null;
  }

  console.log(`Found pinjaman: ${pinjaman.pinjaman_id}, status: ${pinjaman.statusPinjaman}`);

  // ✅ Cek apakah sudah diklaim dengan join yang benar
  const creditExists = await Credit.findOne({
    include: [{
      model: Transaksi,
      where: {
        nasabah_id: nasabah_id,
        transaksiType: "MASUK",
        keterangan: "PINJAMAN"
      }
    }],
    where: {
      jumlahSaldoBertambah: pinjaman.jumlahPinjaman
    }
  });

  const claimed = !!creditExists;
  console.log(`Pinjaman ${pinjaman.pinjaman_id} claimed: ${claimed}`);

  return {
    pinjaman_id: pinjaman.pinjaman_id,
    jumlahPinjaman: pinjaman.jumlahPinjaman,
    statusJatuhTempo: pinjaman.statusJatuhTempo,
    statusPinjaman: pinjaman.statusPinjaman,
    claimed
  };
};