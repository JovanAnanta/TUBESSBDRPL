import { Request, Response } from "express";
import { ajukanPinjamanService } from "../service/PinjamanService";
import { getTagihanPinjamanByUser } from "../service/PinjamanService";
import { bayarTagihanPinjaman, claimPinjamanService } from "../service/PinjamanService";
import { getPinjamanStatusService } from "../service/PinjamanService";

export const ajukanPinjaman = async (req: Request, res: Response) => {
  try {
    const nasabah_id = (req.user as any).id;
    const { jumlahPinjaman, statusJatuhTempo } = req.body;

    if (!jumlahPinjaman || !statusJatuhTempo) {
      res.status(400).json({ message: "Lengkapi data pinjaman" });
      return;
    }

    const result = await ajukanPinjamanService(nasabah_id, jumlahPinjaman, statusJatuhTempo);

    res.status(201).json({
      message: "Pengajuan pinjaman berhasil, menunggu konfirmasi admin.",
      data: result
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getTagihanPinjaman = async (req: Request, res: Response) => {
  try {
    const nasabah_id = (req.user as any).id;

    const tagihanList = await getTagihanPinjamanByUser(nasabah_id);

    res.status(200).json({ 
      message: "Berhasil mengambil tagihan",
      data: tagihanList || []  // ✅ Pastikan return array
    });
  } catch (err: any) {
    console.error("Error get tagihan:", err);
    res.status(500).json({ 
      message: err.message,
      data: [] // ✅ Return empty array saat error
    });
  }
};

export const bayarTagihan = async (req: Request, res: Response) => {
  try {
    const nasabah_id = (req.user as any).id;
    const { tagihan_id } = req.params; // ✅ Ubah dari id ke tagihan_id

    const result = await bayarTagihanPinjaman(tagihan_id, nasabah_id);

    res.status(200).json({
      message: "Pembayaran tagihan berhasil",
      data: result
    });
  } catch (err: any) {
    console.error("Error bayar tagihan:", err);
    res.status(400).json({ message: err.message });
  }
};

export const claimPinjaman = async (req: Request, res: Response) => {
  try {
    const { pinjaman_id } = req.params;
    const nasabah_id = (req.user as any).id;

    const result = await claimPinjamanService(nasabah_id, pinjaman_id);

    res.status(200).json(result);
  } catch (err: any) {
    console.error("Error claim pinjaman:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getPinjamanStatus = async (req: Request, res: Response) => {
  try {
    const nasabah_id = (req.user as any).id;
    const data = await getPinjamanStatusService(nasabah_id);

    if (!data) {
      res.status(404).json({ 
        message: "Tidak ada pinjaman aktif",
        data: null 
      });
    }

    res.status(200).json({ 
      message: "Berhasil mengambil status pinjaman",
      data 
    });
  } catch (err: any) {
    console.error("Error get status pinjaman:", err);
    res.status(500).json({ 
      message: err.message,
      data: null
    });
  }
};