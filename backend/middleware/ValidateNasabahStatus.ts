import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Nasabah } from '../models/Nasabah';

const JWT_SECRET = "your_jwt_secret_key";

interface AuthenticatedRequest extends Request {
  nasabah_id?: string;
}

export const validateNasabahStatus = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      res.status(401).json({ 
        success: false,
        message: "Token diperlukan untuk mengakses resource ini" 
      });
      return;
    }

    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    
    // Cari nasabah berdasarkan ID dari token
    const nasabah = await Nasabah.findOne({ 
      where: { nasabah_id: decoded.nasabah_id },
      attributes: ['nasabah_id', 'status']
    });

    if (!nasabah) {
      res.status(404).json({ 
        success: false,
        message: "Nasabah tidak ditemukan" 
      });
      return;
    }

    // Cek status nasabah
    if (nasabah.status !== 'AKTIF') {
      res.status(403).json({ 
        success: false,
        message: "Akun Anda sedang diblokir. Silakan hubungi customer service untuk informasi lebih lanjut." 
      });
      return;
    }

    // Tambahkan nasabah_id ke request untuk digunakan di controller
    req.nasabah_id = nasabah.nasabah_id;
    
    next();
  } catch (error) {
    console.error('Error in validateNasabahStatus middleware:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false,
        message: "Token tidak valid" 
      });
      return;
    }
    
    res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan sistem" 
    });
  }
};
