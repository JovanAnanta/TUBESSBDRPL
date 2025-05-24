import { Request, Response } from 'express';
import * as AuthService from '../service/AuthService';
import { Nasabah } from '../models/Nasabah';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { encrypt,decrypt } from '../enkripsi/Encryptor';
import { LoginActivity } from '../models/LoginActivity';
import geoip from 'geoip-lite';

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
  const { kodeAkses, password, lat, long } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const device_info = req.headers['user-agent'] || 'Unknown';

  try {
    const encryptedKodeAkses = encrypt(kodeAkses);
    const nasabah = await Nasabah.findOne({ where: { kodeAkses: encryptedKodeAkses } });

    const status = nasabah ? (encrypt(password) === nasabah.password ? 'SUCCESS' : 'FAILED') : 'FAILED';

    // Tentukan lokasi
    let location = 'Unknown';
    if (lat && long) {
      location = `lat:${lat}, long:${long}`;
    } else {
      const geo = geoip.lookup(ip as string);
      if (geo) location = `${geo.city || 'Unknown City'}, ${geo.country || 'Unknown Country'}`;
    }

    // Simpan aktivitas login
    await LoginActivity.create({
      nasabah_id: nasabah?.nasabah_id || null,
      waktu_login: new Date(),
      location,
      device_info,
      status
    });

    // Jika gagal login, balas error
    if (!nasabah || encrypt(password) !== nasabah.password) {
      throw new Error('Kode Akses atau Password Tidak Ditemukan');
    }

    const token = jwt.sign(
      { nasabah_id: nasabah.nasabah_id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const pinStatus = nasabah.pin === encrypt('') ? 'empty' : 'set';

    res.status(200).json({
      token,
      nasabah_id: nasabah.nasabah_id,
      pinStatus,
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
    return;
  }
  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Mengambil user berdasarkan user_id yang ada di dalam token
    const nasabah = await Nasabah.findOne({ where: { nasabah_id: decoded.nasabah_id } });

    
    if (!nasabah) {
      res.status(404).json({ message: "nasabah not found" });
      return;
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
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};