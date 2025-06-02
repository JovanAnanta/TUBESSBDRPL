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

export const bayarTagihan = async (req: Request, res: Response) => {
  try {
    const nasabah_id = (req.user as any).id;
    const { id } = req.params;

    const result = await bayarTagihanPinjaman(id, nasabah_id);

    res.status(200).json({
      message: "Pembayaran tagihan berhasil",
      data: result
    });
  } catch (err: any) {
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
    res.status(400).json({ message: err.message });
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
};
