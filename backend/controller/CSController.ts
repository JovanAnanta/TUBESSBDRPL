import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginCS } from '../service/CSService';
import { getDashboardStats } from '../service/CSService';
import { encrypt, decrypt } from '../enkripsi/Encryptor';
import { verifyNasabahData as verifyNasabahService } from '../service/CSService';
import { resetNasabahPassword } from '../service/CSService';
import { verifyNasabahForReset as verifyNasabahForResetService } from '../service/CSService';

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

export const verifyNasabahForReset = async (req: Request, res: Response) => {
  try {
    const { nama, email, noRekening } = req.body;

    if (!nama || !email || !noRekening) {
      res.status(400).json({ message: 'Semua field harus diisi' });
      return;
    }

    const nasabah = await verifyNasabahForResetService(nama, email, noRekening);
    if (!nasabah) {
      res.status(404).json({ 
        message: "Data nasabah tidak ditemukan atau tidak sesuai" 
      });
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
        status: nasabah.status
      }
    });
  } catch (error) {
    console.error('Verifikasi nasabah error:', error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

export const resetPasswordNasabah = async (req: Request, res: Response) => {
  try {
    const { email, nama, noRekening, passwordBaru } = req.body;

    if (!email || !nama || !noRekening || !passwordBaru) {
      res.status(400).json({ message: 'Semua field wajib diisi' });
      return;
    }

    const updated = await resetNasabahPassword(email, nama, noRekening, passwordBaru);
    if (!updated) {
      res.status(404).json({ message: 'Data nasabah tidak ditemukan atau tidak sesuai' });
      return; 
    }
    
    res.status(200).json({ 
      message: 'Password berhasil direset', 
      data: {
        nama: decrypt(updated.nama),
        email: decrypt(updated.email)
      } 
    });
  } catch (err: any) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: err.message || 'Terjadi kesalahan saat reset password' });
  }
};
