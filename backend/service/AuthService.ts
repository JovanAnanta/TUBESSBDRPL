import { Nasabah } from '../models/Nasabah';
import { encrypt, decrypt } from '../enkripsi/Encryptor';
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt, { hash } from "bcryptjs";

function generateNomorRekeningDenganPrefix(prefix: string = '3480', digitTambahan: number = 6): string {
  let randomDigits = '';
  for (let i = 0; i < digitTambahan; i++) {
    const digit = Math.floor(Math.random() * 10);
    randomDigits += digit.toString();
  }
  return prefix + randomDigits;
}

export const registerNasabah = async (data: any) => {
  const { nama, email, password, noRekening, pin, saldo, kodeAkses, status } = data;

  try {
    const existingUser = await Nasabah.findOne({ where: { email: encrypt(email) } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const existingPassword = await Nasabah.findOne({ where: { password: encrypt(password) } });
    if (existingPassword) {
      throw new Error('Password already registered');
    }

    let noRekeningGenerated = generateNomorRekeningDenganPrefix();
    while (await Nasabah.findOne({ where: { noRekening: encrypt(noRekeningGenerated) } })) {
      noRekeningGenerated = generateNomorRekeningDenganPrefix();
    }

    const existingKodeAkses = await Nasabah.findOne({ where: { kodeAkses: encrypt(kodeAkses) } });
    if (existingKodeAkses) {
      throw new Error('KodeAkses already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const created = await Nasabah.create({
      nama: encrypt(nama),
      email: encrypt(email),
      password: hashedPassword,
      noRekening: encrypt(noRekeningGenerated),
      pin: encrypt(''),
      saldo: Number(saldo),
      kodeAkses: encrypt(kodeAkses),
      status: 'AKTIF',
    });

    return created;
  } catch (error) {
    throw new Error(`Registration failed: ${(error as Error).message}`);
  }
};
