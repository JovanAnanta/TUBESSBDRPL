import { Request, Response } from "express";
import { getLoginActivityByNasabah } from "../service/CSActivityService";
import { getAllTransaksiByNasabah, formatTransaksiData } from "../service/CSActivityService";

export const getLoginActivity = async (req: Request, res: Response) => {
  const { nasabahId } = req.params;

  try {
    const logins = await getLoginActivityByNasabah(nasabahId);
    res.status(200).json({ message: "Aktivitas login ditemukan", data: logins });
  } catch (error) {
    console.error("Gagal mengambil aktivitas login:", error);
    res.status(500).json({ message: "Gagal mengambil data aktivitas login" });
  }
};

export const getNasabahTransactions = async (req: Request, res: Response) => {
  const { nasabahId } = req.params;

  try {
    const transaksi = await getAllTransaksiByNasabah(nasabahId);
    const formatted = formatTransaksiData(transaksi);

    res.status(200).json({ message: "Riwayat transaksi ditemukan", data: formatted });
  } catch (error) {
    console.error("Gagal mengambil riwayat transaksi:", error);
    res.status(500).json({ message: "Gagal mengambil data transaksi" });
  }
};
