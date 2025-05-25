import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginCS } from '../service/CSService';
import { getDashboardStats } from '../service/CSService';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const cs = await loginCS(email, password);

    if (!cs) {
      res.status(401).json({ message: "Email atau Password salah" });
      return;
    }

    const token = jwt.sign(
      { cs_id: cs.cs_id, role: 'cs' },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({ token, nama: cs.nama });
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Gagal mengambil statistik CS:', error);
    res.status(500).json({ message: 'Gagal mengambil statistik' });
  }
};

import { verifyNasabahData as verifyNasabahService } from '../service/CSService';

export const verifyNasabahData = async (req: Request, res: Response) => {
  const { nama, email, password } = req.body;

  try {
    const nasabah = await verifyNasabahService(nama, email, password);

    if (!nasabah) {
      res.status(404).json({ message: "Data tidak cocok atau nasabah tidak ditemukan" });
      return;
    }

    res.status(200).json({
      message: "Nasabah berhasil diverifikasi",
      nasabah: {
        nasabah_id: nasabah.nasabah_id,
        nama: nasabah.nama,
        email: email,
        saldo: nasabah.saldo,
        noRekening: nasabah.noRekening
      }
    });
  } catch (err) {
    console.error("Verifikasi nasabah gagal:", err);
    res.status(500).json({ message: "Terjadi kesalahan server saat verifikasi" });
  }
};
