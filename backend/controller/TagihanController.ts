import { Request, Response } from 'express';
import { TagihanType } from '../models/Tagihan';
import * as TagihanService from '../service/TagihanService';

export const bayarTagihan = async (req: Request, res: Response) => {
  try {
    const { nomorTagihan, jumlahBayar } = req.body;
    const nasabah_id = req.user?.id;
    const type = req.params.type?.toUpperCase();

    if (!nasabah_id || !nomorTagihan || !jumlahBayar) {
      res.status(400).json({ message: 'Data tidak lengkap' });
      return;
    }

    if (!Object.values(TagihanType).includes(type as TagihanType)) {
      res.status(400).json({ message: 'Tipe tagihan tidak valid' });
      return;
    }

    const result = await TagihanService.bayarTagihan(
      String(nasabah_id),
      type as TagihanType,
      String(nomorTagihan),
      Number(jumlahBayar)
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Internal server error' });
  }
};


export const getRiwayatTagihan = async (req: Request, res: Response) => {
  try {
    const nasabah_id = req.user?.id;
    if (!nasabah_id) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const riwayat = await TagihanService.getRiwayatTagihan(String(nasabah_id));
    res.status(200).json(riwayat);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Internal server error' });
  }
};