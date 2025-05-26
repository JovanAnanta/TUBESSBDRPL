import { Request, Response } from 'express';
import * as pinService from '../service/PinService';
import { bayarTagihan as bayarTagihanService } from '../service/TagihanService';

export const bayarTagihan = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const tipeUpper = type.toUpperCase();
    const { nomorTagihan, jumlahBayar, pin } = req.body;

    if (!nomorTagihan || !jumlahBayar || jumlahBayar <= 0) {
      return res.status(400).json({ message: 'Data pembayaran tidak valid' });
    }

    const nasabahId = (req as any).user?.id;
    if (!nasabahId) {
      return res.status(401).json({ message: 'User tidak terautentikasi' });
    }

    if (!pin) {
      return res.status(400).json({ message: 'PIN diperlukan untuk transaksi ini' });
    }
    
    const verifyResult = await pinService.verifyPin(nasabahId, pin);
    if (!verifyResult.success) {
      return res.status(401).json({ message: verifyResult.message || 'PIN tidak valid' });
    }

    const result = await bayarTagihanService(
      nasabahId,
      tipeUpper,
      nomorTagihan,
      jumlahBayar
    );

    return res.json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Terjadi kesalahan server' });
  }
};