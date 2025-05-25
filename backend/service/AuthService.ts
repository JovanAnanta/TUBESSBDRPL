
import { decrypt } from '../enkripsi/Encryptor';
import { Request, Response } from "express";
import { Nasabah } from "../models/Nasabah";
import { encrypt } from "../enkripsi/Encryptor";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


function generateNomorRekeningDenganPrefix(prefix: string = '3480', digitTambahan: number = 6): string {
  let randomDigits = '';
  for (let i = 0; i < digitTambahan; i++) {
    const digit = Math.floor(Math.random() * 10);
    randomDigits += digit.toString();
  }
  return prefix + randomDigits;
}

export const registerNasabah = async (data: any) => {
  const { nama, email, password, noRekening, pin, saldo, kodeAkses, status} = data;
  
  try {
    const existingUser = await Nasabah.findOne({ where: { email: encrypt(email) } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hapus pengecekan password yang sudah ada karena bcrypt hash akan selalu berbeda
    // const existingPassword = await Nasabah.findOne({ where: { password: encrypt(password) } });
    // if (existingPassword) {
    //   throw new Error('Password already registered');
    // }

    let noRekening = generateNomorRekeningDenganPrefix();
    while (await Nasabah.findOne({ where: { noRekening } })) {
      noRekening = generateNomorRekeningDenganPrefix();
    }

    const existingKodeAkses = await Nasabah.findOne({ where: { kodeAkses: encrypt(kodeAkses) } });
    if (existingKodeAkses) {
      throw new Error('KodeAkses already registered');
    }

    // Hash password menggunakan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  
    const created = await Nasabah.create({
      nama: encrypt(data.nama),
      email: encrypt(data.email),
      password: hashedPassword, // Menggunakan bcrypt hash
      noRekening : encrypt(noRekening),
      pin: encrypt(''),
      saldo: Number(data.saldo),
      kodeAkses: encrypt(data.kodeAkses),
      status: 'AKTIF',
    });

    return created;
  } catch (error) {
    throw new Error(`Registration failed: ${(error as Error).message}`);
  }
};