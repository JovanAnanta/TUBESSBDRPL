import { Request, Response } from 'express';
import * as AuthService from '../service/AuthService';
import { Nasabah } from '../models/Nasabah';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { encrypt, decrypt } from '../enkripsi/Encryptor';
import { LoginActivity } from '../models/LoginActivity';
import geoip from 'geoip-lite';
import fetch from 'node-fetch';

const JWT_SECRET = "your_jwt_secret_key";

// Reverse geocoding function using OpenStreetMap Nominatim
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
    const data = await res.json() as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        country?: string;
      };
    };

    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county;
    const country = data.address?.country;

    return city && country ? `${city}, ${country}` : 'Unknown';
  } catch (err) {
    console.error("Reverse geocode failed:", err);
    return 'Unknown';
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const nasabah = await AuthService.registerNasabah(req.body);
    res.status(201).json(nasabah);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'An unknown error occurred' });
  }
};

// export const loginNasabah = async (req: Request, res: Response): Promise<void> => {
//   const { kodeAkses, password, status } = req.body;

//   try {
//     const encryptedKodeAkses = encrypt(kodeAkses);
//     const nasabah = await Nasabah.findOne({ where: { kodeAkses: encryptedKodeAkses } });

//     if (!nasabah) {
//       throw new Error('Kode Akses atau Password Tidak Ditemukan');
//     }    const isMatch = await bcrypt.compare(password, nasabah.password);
//     if (!isMatch) {
//       throw new Error('Kode Akses atau Password Tidak Ditemukan');
//     }

//     if (nasabah.status !== 'AKTIF') {
//       throw new Error('Akun Anda sedang diblokir. Silakan hubungi customer service untuk informasi lebih lanjut.');
//     }

//     const token = jwt.sign(
//       {
//         nasabah_id: nasabah.nasabah_id
//       },
//       JWT_SECRET,
//       { expiresIn: '1h' } // Token expired dalam 1 jam
//     );

//     const pinStatus = nasabah.pin === encrypt('') ? 'empty' : 'set'; // Jika PIN kosong, set ke 'empty'

//     const decryptedNama = decrypt(nasabah.nama);
//     const decryptedPin = decrypt(nasabah.pin);
    
//     res.status(200).json({
//       token,
//       nasabah_id: nasabah.nasabah_id,
//       pinStatus: decryptedPin,
//       nama: decryptedNama,
//       status: nasabah.status,
//       saldo: nasabah.saldo,
//     });
//   } catch (err) {
//     if (err instanceof Error) {
//       res.status(400).json({ message: err.message });
//     } else {
//       res.status(500).json({ message: "Internal server error" });
//     }
//   }
// };


export const login = async (req: Request, res: Response): Promise<void> => {
  const { kodeAkses, password, lat, long } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'Unknown';

  try {
    const encryptedKodeAkses = encrypt(kodeAkses);
    const nasabah = await Nasabah.findOne({ where: { kodeAkses: encryptedKodeAkses } });

    if (!nasabah) {
      throw new Error('Kode Akses atau Password Tidak Ditemukan');
    }

    const passwordValid = await bcrypt.compare(password, nasabah.password);
    const status = passwordValid ? 'SUCCESS' : 'FAILED';

    // Lokasi
    let location = 'Unknown';
    if (lat && long) {
      location = await reverseGeocode(lat, long);
    } else {
      const geo = geoip.lookup(ip as string);
      location = geo?.city && geo?.country ? `${geo.city}, ${geo.country}` : 'Bandung, Indonesia';
    }

    // Device Info
    let device_info = 'Unknown';
    if (userAgent.includes("Android")) device_info = "Mobile App - Android";
    else if (userAgent.includes("iPhone") || userAgent.includes("iOS")) device_info = "Mobile App - iOS";
    else if (userAgent.includes("Chrome")) device_info = "Web Browser - Chrome";
    else if (userAgent.includes("Safari")) device_info = "Web Browser - Safari";
    else if (userAgent.includes("Firefox")) device_info = "Web Browser - Firefox";
    else if (userAgent.includes("Windows")) device_info = "Web Browser - Windows";
    else device_info = userAgent;

    await LoginActivity.create({
      nasabah_id: nasabah?.nasabah_id || null,
      waktu_login: new Date(),
      location,
      device_info,
      status,
    });

    if (!passwordValid) {
      throw new Error('Kode Akses atau Password Tidak Ditemukan');
    }

    if (nasabah.status !== 'AKTIF') {
      throw new Error('Akun Anda sedang diblokir. Silakan hubungi customer service.');
    }

    const token = jwt.sign({ nasabah_id: nasabah.nasabah_id }, JWT_SECRET, { expiresIn: '1h' });
    const decryptedPin = decrypt(nasabah.pin);
    const pinStatus = decryptedPin === '' ? 'empty' : 'set';

    res.status(200).json({
      token,
      nasabah_id: nasabah.nasabah_id,
      pinStatus,
      nama: decrypt(nasabah.nama),
      status: nasabah.status,
      saldo: nasabah.saldo
    });

  } catch (err) {
    res.status(400).json({ message: err instanceof Error ? err.message : 'Terjadi kesalahan saat login' });
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
        nama: decrypt(nasabah.nama),
        email: decrypt(nasabah.email),
        noRekening: decrypt(nasabah.noRekening),
        pin: decrypt(nasabah.pin),
        saldo: nasabah.saldo,
        kodeAkses: decrypt(nasabah.kodeAkses),
        status: nasabah.status,
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

// export const getNasabahData = async (req: Request, res: Response): Promise<void> => {
//   const token = req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     res.status(401).json({ message: "Token is required" });
//     return;
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
//     const nasabah = await Nasabah.findOne({ where: { nasabah_id: decoded.nasabah_id } });

//     if (!nasabah) {
//       res.status(404).json({ message: "nasabah not found" });
//       return;
//     }

//     res.status(200).json({
//       message: "nasabah data fetched successfully",
//       data: {
//         nasabah_id: nasabah.nasabah_id,
//         nama: nasabah.nama,
//         email: nasabah.email,
//         noRekening: nasabah.noRekening,
//         pin: nasabah.pin,
//         saldo: nasabah.saldo,
//         kodeAkses: nasabah.kodeAkses,
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching user data:", error);
//     if (error instanceof jwt.JsonWebTokenError) {
//       res.status(401).json({ message: "Invalid token" });
//       return;
//     }
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
