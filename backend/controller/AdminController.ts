import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginAdminService } from '../service/AdminService';
import { decrypt } from '../enkripsi/Encryptor';
import { getPendingPinjamanService, konfirmasiPinjamanService } from '../service/AdminService';
import { ubahStatusNasabahService } from '../service/AdminService';
import { getAllNasabahService } from '../service/AdminService';

const JWT_SECRET = "your_jwt_secret_key";

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await loginAdminService(email, password);

    const token = jwt.sign({ admin_id: admin.admin_id, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({
      token,
      nama: decrypt(admin.nama),
      email
    });
  } catch (err: any) {
    console.error("Admin login error:", err);
    res.status(400).json({ message: err.message });
  }
};


export const getPendingPinjaman = async (req: Request, res: Response) => {
  try {
    const pinjamans = await getPendingPinjamanService();
    res.status(200).json({ data: pinjamans });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const konfirmasiPinjaman = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

  if (!['ACCEPTED', 'REJECTED'].includes(status)) {
    res.status(400).json({ message: 'Status harus ACCEPTED atau REJECTED' });
    return;
  }


    const result = await konfirmasiPinjamanService(id, status);
    res.status(200).json({ message: 'Status pinjaman diperbarui', data: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


// export const blokirNasabah = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const updated = await blokirNasabahService(id);
//     res.status(200).json({
//       message: 'Status nasabah berhasil diubah ke TIDAK AKTIF',
//       data: updated
//     });
//   } catch (err: any) {
//     console.error('Error blokir nasabah:', err);
//     res.status(400).json({ message: err.message });
//   }
// };

export const getAllNasabah = async (req: Request, res: Response) => {
  try {
    const nasabahList = await getAllNasabahService();
    res.status(200).json({ data: nasabahList });
  } catch (err: any) {
    console.error('Error fetch nasabah:', err);
    res.status(500).json({ message: err.message });
  }
};

export const ubahStatusNasabah = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['AKTIF', 'TIDAK AKTIF'].includes(status)) {
      res.status(400).json({ message: 'Status harus AKTIF atau TIDAK AKTIF' });
      return;
    }

    const updated = await ubahStatusNasabahService(id, status);
    res.status(200).json({
      message: `Status nasabah berhasil diubah ke ${status}`,
      data: updated
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};
