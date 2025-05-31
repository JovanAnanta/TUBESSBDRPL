import { Request, Response } from "express";
import { ajukanPinjamanService } from "../service/PinjamanService";
import { getTagihanPinjamanByUser } from "../service/PinjamanService";
import { bayarTagihanPinjaman, claimPinjamanService } from "../service/PinjamanService";

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

    res.status(200).json({ data: tagihanList });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

<<<<<<< HEAD
  static async create(req: Request, res: Response) {
    try {
      const pinjamanData = req.body.pinjaman;
      const transaksiData = req.body.transaksi;
      const pin = req.body.pin;
=======
export const bayarTagihan = async (req: Request, res: Response) => {
  try {
    const nasabah_id = (req.user as any).id;
    const { id } = req.params;
>>>>>>> aa05c0fe0fb1a0114cbbf67504e9240d6c2e5072

    const result = await bayarTagihanPinjaman(id, nasabah_id);

<<<<<<< HEAD
      const nasabahId = transaksiData.nasabah_id;
      if (!nasabahId) {
        return res.status(401).json({ message: "User tidak terautentikasi" });
      }

      // Verify PIN before processing loan application
      if (!pin) {
        return res.status(400).json({ message: "PIN diperlukan untuk transaksi ini" });
      }
      
      const verifyResult = await pinService.verifyPin(nasabahId, pin);
      if (!verifyResult.success) {
        return res.status(401).json({ message: verifyResult.message || "PIN tidak valid" });
      }

      const result = await PinjamanService.create(pinjamanData, transaksiData);

      res.status(201).json({
        message: "Pinjaman created and pending approval",
        transaksi: result.transaksi,
        pinjaman: result.pinjaman,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Error creating pinjaman" });
    }
=======
    res.status(200).json({
      message: "Pembayaran tagihan berhasil",
      data: result
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
>>>>>>> aa05c0fe0fb1a0114cbbf67504e9240d6c2e5072
  }
};

<<<<<<< HEAD
  static async update(req: Request, res: Response) {
    try {
      const result = await PinjamanService.update(req.params.id, req.body);
      if (!result) {
        res.status(404).json({ error: "Pinjaman not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Failed to update", details: error });
    }
=======
export const claimPinjaman = async (req: Request, res: Response) => {
  try {
    const { pinjaman_id } = req.params;
    const nasabah_id = (req.user as any).id;

    const result = await claimPinjamanService(nasabah_id, pinjaman_id);

    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
>>>>>>> aa05c0fe0fb1a0114cbbf67504e9240d6c2e5072
  }
};

import { getPinjamanStatusService } from "../service/PinjamanService";

export const getPinjamanStatus = async (req: Request, res: Response) => {
  try {
    const nasabah_id = (req.user as any).id;
    const data = await getPinjamanStatusService(nasabah_id);

    res.status(200).json({ data });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
<<<<<<< HEAD
}

export default PinjamanController;
=======
};
>>>>>>> aa05c0fe0fb1a0114cbbf67504e9240d6c2e5072
