import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { loginAdminService } from '../service/AdminService';
import { decrypt } from '../enkripsi/Encryptor';

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
