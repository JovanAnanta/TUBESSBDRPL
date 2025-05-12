import { Request, Response } from 'express';
import * as AuthService from '../service/AuthService';
import { Nasabah } from '../models/Nasabah';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { encrypt,decrypt } from '../enkripsi/Encryptor';


const JWT_SECRET = "your_jwt_secret_key";

export const register = async (req: Request, res: Response) => {
  try {
    const nasabah = await AuthService.registerNasabah(req.body);
    res.status(201).json(nasabah);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'An unknown error occurred' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { kodeAkses, password } = req.body;

  try {
    const encryptedKodeAkses = encrypt(kodeAkses);
    const nasabah = await Nasabah.findOne({ where: { kodeAkses: encryptedKodeAkses } });

    if (!nasabah) {
      throw new Error('Kode Akses atau Password salah 1');
    }

    const encryptedInputPassword = encrypt(password);
    if (encryptedInputPassword !== nasabah.password) {
      throw new Error('Kode Akses atau Password salah 2');
    }


    const token = jwt.sign(
      {
        nasabah_id: nasabah.nasabah_id
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expired dalam 1 jam
    );

    const pinStatus = nasabah.pin === encrypt('') ? 'empty' : 'set'; // Jika PIN kosong, set ke 'empty'

    res.status(200).json({
      token,
      nasabah_id: nasabah.nasabah_id,
      pinStatus,  // Kirim status PIN
      nama: nasabah.nama,
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getNasabahData = async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1]; // Mengambil token dari header Authorization

    if (!token) {
    res.status(401).json({ message: "Token is required" });
    return
  }
  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Mengambil user berdasarkan user_id yang ada di dalam token
    const nasabah = await Nasabah.findOne({ where: { nasabah_id: decoded.nasabah_id } });

    
    if (!nasabah) {
      res.status(404).json({ message: "nasabah not found" });
      return
    }

    res.status(200).json({
      message: "nasabah data fetched successfully", // Menambahkan pesan sukses
      data: { 
        nasabah_id: nasabah.nasabah_id,
        nama: nasabah.nama,
        email: nasabah.email,
        noRekening: nasabah.noRekening,
        pin: nasabah.pin,
        saldo: nasabah.saldo,
        kodeAkses: nasabah.kodeAkses,
      }
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Menangani error jika token tidak valid atau ada kesalahan lainnya
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return
    }
    res.status(500).json({ message: "Internal server error" });
  }
};