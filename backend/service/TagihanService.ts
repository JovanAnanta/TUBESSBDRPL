import { v4 as uuidv4 } from 'uuid';
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

    try {
        const nasabah = await Nasabah.findByPk(nasabah_id);
        if (!nasabah) throw new Error("Nasabah tidak ditemukan");

        if (nasabah.saldo < jumlahBayar) throw new Error("Saldo tidak mencukupi");

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

        console.log("Saldo sebelum bayar:", nasabah.saldo);
        nasabah.saldo -= jumlahBayar;
        console.log("Saldo setelah dikurangi:", nasabah.saldo);
        await nasabah.save();
        console.log("Saldo nasabah sudah disimpan");

        const transaksi = await Transaksi.findOne({
            include: [
                {
                    model: Tagihan,
                    where: {
                        statusTagihanType,
                        nomorTagihan
                    }
                }
            ],
            where: { 
                nasabah_id,
                keterangan: statusTagihanType === "AIR" ? "TAGIHAN AIR" : "TAGIHAN LISTRIK"
            }
        });

        if (!transaksi || !transaksi.Tagihan) {
            throw new Error("Tagihan tidak ditemukan");
        }
        console.log("Transaksi baru dibuat:", transaksi.transaksi_id);

        const debit = await Debit.create({
            debit_id: uuidv4(),
            transaksi_id: transaksi.transaksi_id,
            jumlahSaldoBerkurang: jumlahBayar
        });
        console.log("Debit baru dibuat:", debit.debit_id);

        return { 
            status: "success", 
            message: `Pembayaran tagihan ${statusTagihanType} berhasil`,
            transaksi_id: transaksi.transaksi_id,
            saldoSekarang: nasabah.saldo
        };
    } catch (error: any) {
        console.error("Error in bayarTagihan:", error);
        throw error; // Re-throw the error to be caught by the controller
    }
};
