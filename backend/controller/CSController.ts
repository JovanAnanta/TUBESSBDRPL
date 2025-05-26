import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginCS } from '../service/CSService';
import { getDashboardStats } from '../service/CSService';
import { encrypt, decrypt } from '../enkripsi/Encryptor';
import { verifyNasabahData as verifyNasabahService } from '../service/CSService';
import { resetNasabahPassword } from '../service/CSService';

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


export const verifyNasabahData = async (req: Request, res: Response) => {
  const { nama, email, password } = req.body;

  try {
    const nasabah = await verifyNasabahService(nama, email, password);
    if (!nasabah) {
      res.status(404).json({ message: "Data nasabah tidak ditemukan atau password salah" });
      return;
    }

    res.status(200).json({
      message: "Verifikasi berhasil",
      data: {
        nasabah_id: nasabah.nasabah_id,
        nama: decrypt(nasabah.nama),
        email: decrypt(nasabah.email),
        noRekening: decrypt(nasabah.noRekening),
        saldo: nasabah.saldo,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const resetPasswordNasabah = async (req: Request, res: Response) => {
  try {
    const { email, passwordBaru } = req.body;

    if (!email || !passwordBaru) {
      res.status(400).json({ message: 'Email dan password baru wajib diisi' });
      return;
    }

    const updated = await resetNasabahPassword(email, passwordBaru);
    res.status(200).json({ message: 'Password berhasil direset', data: updated });
    return;
  } catch (err: any) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: err.message });
  }
};
