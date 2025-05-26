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
        throw new Error("Tipe tagihan tidak valid");
    }

    if (statusTagihanType === "AIR" && !nomorTagihan.startsWith("PDAM")) {
        throw new Error("Nomor tagihan AIR harus dimulai dengan 'PDAM'");
    }

    if (statusTagihanType === "LISTRIK" && !nomorTagihan.startsWith("PLN")) {
        throw new Error("Nomor tagihan LISTRIK harus dimulai dengan 'PLN'");
    }

    const nasabah = await Nasabah.findByPk(nasabah_id);
    if (!nasabah) throw new Error("Nasabah tidak ditemukan");

    if (nasabah.saldo < jumlahBayar) throw new Error("Saldo tidak mencukupi");

    // Cek apakah tagihan dengan nomorTagihan dan tipe ada dan belum dibayar
    const tagihan = await Tagihan.findOne({
        where: {
            statusTagihanType,
            nomorTagihan
        },
        include: [
            {
                model: Transaksi,
                where: { nasabah_id }
            }
        ]
    });

    if (!tagihan) {
        throw new Error("Tagihan tidak ditemukan");
    }

    const debitExists = await Debit.findOne({
        where: { transaksi_id: tagihan.transaksi_id }
    });
    if (debitExists) {
        throw new Error("Tagihan sudah dibayar");
    }

    // Tentukan keterangan
    const keterangan = statusTagihanType === "AIR" ? "TAGIHAN AIR" : "TAGIHAN LISTRIK";

    // Buat transaksi pembayaran baru
    const transaksi = await Transaksi.create({
        nasabah_id,
        transaksiType: "KELUAR",
        tanggalTransaksi: new Date(),
        keterangan
    });

    // Update saldo nasabah
    nasabah.saldo -= jumlahBayar;
    await nasabah.save();

    // Buat debit untuk transaksi pembayaran
    await Debit.create({
        transaksi_id: transaksi.transaksi_id,
        jumlahSaldoBerkurang: jumlahBayar
    });

    return { status: "success", message: `Pembayaran tagihan ${statusTagihanType} berhasil` };
};
