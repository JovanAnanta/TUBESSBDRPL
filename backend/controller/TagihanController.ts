import { Request, Response } from 'express';
import { Nasabah } from '../models/Nasabah';
import { Tagihan } from '../models/Tagihan';

export const bayarTagihan = async (req: Request, res: Response) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request params:', req.params);
    const { type } = req.params;
    const tipeUpper = type.toUpperCase();

    const { nomorTagihan, jumlahBayar } = req.body;

    if (!nomorTagihan || !jumlahBayar || jumlahBayar <= 0) {
      res.status(400).json({ message: 'Data pembayaran tidak valid' });
      return;
    }

    const nasabahId = (req as any).user?.id;
    console.log('Nasabah ID:', nasabahId);
    if (!nasabahId) {
      res.status(401).json({ message: 'User tidak terautentikasi' });
      return;
    }

    const nasabah = await Nasabah.findByPk(nasabahId);
    if (!nasabah) {
      res.status(404).json({ message: 'Nasabah tidak ditemukan' });
      return;
    }

    if (nasabah.saldo < jumlahBayar) {
      res.status(400).json({ message: 'Saldo tidak cukup' });
      return;
    }

    const tagihan = await Tagihan.findOne({
      where: {
        nomorTagihan,
        statusTagihanType: tipeUpper,
      }
    });

    if (!tagihan) {
      res.status(404).json({ message: `Tagihan dengan nomor ${nomorTagihan} tipe ${tipeUpper} tidak ditemukan` });
      return;
    }

    nasabah.saldo -= jumlahBayar;
    await nasabah.save();


    res.json({ message: 'Pembayaran berhasil' });
    return;

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
    return;
  }
};
