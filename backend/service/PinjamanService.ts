import { v4 as uuidv4 } from "uuid";
import { Pinjaman } from "../models/Pinjaman";
import { Transaksi } from "../models/Transaksi";

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);

  if (d.getMonth() !== targetMonth % 12) {
    d.setDate(0); // Fix month overflow (e.g. Jan 31 + 1 month)
  }
  return d;
}

const tempoMapping: Record<string, number> = {
  "6BULAN": 6,
  "12BULAN": 12,
  "24BULAN": 24,
};

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

    // Create transaksi first
    const transaksi = await Transaksi.create({
      ...transaksiData,
      tanggalTransaksi: new Date(),
    });

    // Calculate jatuh tempo date
    const bulan = tempoMapping[data.statusJatuhTempo] || 6;
    const tanggalJatuhTempo = addMonths(new Date(), bulan);

    // Create pinjaman linked to transaksi
    const pinjamanData = {
      ...data,
      pinjaman_id: uuidv4(),
      transaksi_id: transaksi.transaksi_id,
      tanggalJatuhTempo,
    };

    const pinjaman = await Pinjaman.create(pinjamanData);

    return { transaksi, pinjaman };
  }

  static async update(id: string, data: any) {
    const pinjaman = await Pinjaman.findByPk(id);
    if (!pinjaman) return null;
    return await pinjaman.update(data);
  }

  static async delete(id: string) {
    const pinjaman = await Pinjaman.findByPk(id);
    if (!pinjaman) return false;
    await pinjaman.destroy();
    return true;
  }
}
