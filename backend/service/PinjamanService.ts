import { Pinjaman } from "../models/Pinjaman";
import { v4 as uuidv4 } from "uuid";
function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
//pinjaman
export class PinjamanService {
  static async getAll() {
    return await Pinjaman.findAll();
  }

  static async getById(id: string) {
    return await Pinjaman.findByPk(id);
  }

  static async create(data: any) {
    // Pastikan transaksi_id ada dan valid
    if (!data.transaksi_id) {
      throw new Error("transaksi_id is required");
    }

    const tempoMapping: Record<string, number> = {
      "6BULAN": 6,
      "12BULAN": 12,
      "24BULAN": 24,
    };

    const bulan = tempoMapping[data.statusJatuhTempo] || 6;
    data.tanggalJatuhTempo = addMonths(new Date(), bulan);

    // Status pinjaman aktif secara default
    if (!data.status) {
      data.status = "active";
    }

    return await Pinjaman.create(data);
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
