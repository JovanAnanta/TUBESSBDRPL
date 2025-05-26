import { v4 as uuidv4 } from "uuid";
import { Nasabah } from "../models/Nasabah";
import { Pinjaman } from "../models/Pinjaman";
import { Transaksi } from "../models/Transaksi";

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);

  if (d.getMonth() !== targetMonth % 12) {
    d.setDate(0);
  }
  return d;
}

const tempoMapping: Record<string, number> = {
  "6BULAN": 6,
  "12BULAN": 12,
  "24BULAN": 24,
};

const BUNGA = 0.03;

function monthDiff(d1: Date, d2: Date) {
  let months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months += d2.getMonth() - d1.getMonth();
  return months;
}

export class PinjamanService {
  static async getAll() {
    return await Pinjaman.findAll();
  }

  static async getById(id: string) {
    return await Pinjaman.findByPk(id);
  }

  static async create(data: any, transaksiData: any) {
    if (!transaksiData.nasabah_id) {
      throw new Error("nasabah_id is required in transaksiData");
    }

    const activePinjaman = await Pinjaman.findOne({
      where: {
        statusPinjaman: ["PENDING", "ACCEPTED"],
      },
      include: [{
        model: Transaksi,
        where: { nasabah_id: transaksiData.nasabah_id }
      }]
    });

    if (activePinjaman) {
      throw new Error("User already has an active pinjaman.");
    }

    const transaksi = await Transaksi.create({
        ...transaksiData,
        tanggalTransaksi: new Date(),
    });
    console.log("Transaksi created:", transaksi.transaksi_id);

    const bulan = tempoMapping[data.statusJatuhTempo] || 6;
    const tanggalJatuhTempo = addMonths(new Date(), bulan);

    const totalPinjaman = data.jumlahPinjaman * (1 + BUNGA);

    const pinjamanData = {
        ...data,
        pinjaman_id: uuidv4(),
        transaksi_id: transaksi.transaksi_id,
        tanggalJatuhTempo,
        jumlahPinjaman: totalPinjaman,
        statusPinjaman: "PENDING",
    };

    const pinjaman = await Pinjaman.create(pinjamanData);
    console.log("Pinjaman created:", pinjaman.pinjaman_id);

    return { 
        transaksi, 
        pinjaman,
        message: "Pengajuan pinjaman berhasil dibuat dan menunggu persetujuan"
    };
  }

  static async update(id: string, data: any) {
    const pinjaman = await Pinjaman.findByPk(id, { include: [Transaksi] });
    if (!pinjaman) return null;

    if (data.statusPinjaman === "REJECTED") {
      if (pinjaman.transaksi_id) {
        const transaksi = await Transaksi.findByPk(pinjaman.transaksi_id);
        if (transaksi) {
          await transaksi.destroy();
        }
      }
      await pinjaman.destroy();
      return null;
    } else {
      return await pinjaman.update(data);
    }
  }

  static async delete(id: string) {
    const pinjaman = await Pinjaman.findByPk(id);
    if (!pinjaman) return false;
    await pinjaman.destroy();
    return true;
  }

  static async processMonthlyDeduction() {
    const acceptedPinjamans = await Pinjaman.findAll({
      where: { statusPinjaman: "ACCEPTED" },
      include: [Transaksi]
    });

    const now = new Date();

    for (const pinjaman of acceptedPinjamans) {
      const transaksi = await Transaksi.findByPk(pinjaman.transaksi_id);
      if (!transaksi) continue;

      const nasabah = await Nasabah.findByPk(transaksi.nasabah_id);
      if (!nasabah) continue;

      const tenorMonths = tempoMapping[pinjaman.statusJatuhTempo] || 6;

      // Check if pinjaman duration reached tenor, delete if yes
      const monthsPassed = monthDiff(pinjaman.createdAt, now);
      if (monthsPassed >= tenorMonths) {
        await pinjaman.destroy();
        console.log(`Pinjaman ${pinjaman.pinjaman_id} reached tenor ${tenorMonths} months and deleted.`);
        continue;
      }

      const monthlyCicilan = pinjaman.jumlahPinjaman / tenorMonths;

      if (nasabah.saldo < monthlyCicilan) {
        console.log(`Nasabah ${nasabah.nasabah_id} saldo insufficient for monthly cicilan.`);
        continue;
      }

      // Deduct monthly cicilan from nasabah saldo
      nasabah.saldo -= monthlyCicilan;
      await nasabah.save();

      // Create transaksi record for monthly deduction
      await Transaksi.create({
        transaksi_id: uuidv4(),
        nasabah_id: nasabah.nasabah_id,
        transaksiType: "KELUAR",
        tanggalTransaksi: now,
        jumlahTransaksi: monthlyCicilan,
        keterangan: `Cicilan pinjaman ${pinjaman.pinjaman_id}`,
      });
    }
  }
}
