import { Request, Response } from "express";
import * as tagihanService from "../service/TagihanService";

export const bayarTagihan = async (req: Request, res: Response) => {
  try {
    const nasabah_id = String(req.user?.id);
    const { statusTagihanType, nomorTagihan, jumlahBayar } = req.body;

    if (!nasabah_id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!statusTagihanType || !nomorTagihan || !jumlahBayar) {
      res.status(400).json({ error: "Data pembayaran tidak lengkap" });
      return;
    }

    const result = await tagihanService.bayarTagihan(
      nasabah_id,
      statusTagihanType,
      nomorTagihan,
      jumlahBayar
    );

    res.status(200).json(result);
    return;
  } catch (error: any) {
    res.status(400).json({ error: error.message });
    return;
  }
};

export const getRiwayatTagihan = async (req: Request, res: Response) => {
  try {
    const nasabah_id = String(req.user?.id);

    if (!nasabah_id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const riwayat = await tagihanService.getRiwayatTagihan(nasabah_id);
    res.status(200).json(riwayat);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
