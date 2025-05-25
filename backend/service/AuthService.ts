import bcrypt from "bcryptjs";
import { encrypt } from '../enkripsi/Encryptor';
import { Nasabah } from '../models/Nasabah';
<<<<<<< HEAD
import { encrypt, decrypt } from '../enkripsi/Encryptor';
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
=======
>>>>>>> origin/main

function generateNomorRekeningDenganPrefix(prefix: string = '3480', digitTambahan: number = 6): string {
  let randomDigits = '';
  for (let i = 0; i < digitTambahan; i++) {
    const digit = Math.floor(Math.random() * 10);
    randomDigits += digit.toString();
  }
  return prefix + randomDigits;
}

export const registerNasabah = async (data: any) => {
  const { nama, email, password, noRekening, pin, saldo, kodeAkses} = data;
  
  try {
    const existingUser = await Nasabah.findOne({ where: { email: encrypt(email) } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const existingPassword = await Nasabah.findOne({ where: { password: encrypt(password) } });
    if (existingPassword) {
      throw new Error('Password already registered');
    }

    let noRekening = generateNomorRekeningDenganPrefix();
    while (await Nasabah.findOne({ where: { noRekening } })) {
      noRekening = generateNomorRekeningDenganPrefix();
    }

    const existingKodeAkses = await Nasabah.findOne({ where: { kodeAkses: encrypt(kodeAkses) } });
    if (existingKodeAkses) {
      throw new Error('KodeAkses already registered');
    }
  
  const created = await Nasabah.create({
    nama: data.nama,
    email: encrypt(data.email),
    password: encrypt(data.password),
    noRekening,
    pin: encrypt(''),
    saldo: Number(data.saldo),
    kodeAkses: encrypt(data.kodeAkses),
  });

  return created;
  } catch (error) {
    throw new Error(`Registration failed: ${(error as Error).message}`);
  }
};