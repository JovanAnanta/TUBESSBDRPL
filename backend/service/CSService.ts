import { encrypt, decrypt } from '../enkripsi/Encryptor';
import { LayananPelanggan } from '../models/LayananPelanggan';
import { Report } from '../models/Report';
import { Nasabah } from '../models/Nasabah';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';

export const loginCS = async (email: string, password: string) => {
  const encryptedEmail = encrypt(email);
  const encryptedPassword = encrypt(password);

  const cs = await LayananPelanggan.findOne({
    where: { email: encryptedEmail, password: encryptedPassword }
  });

  return cs;
};


export const getDashboardStats = async () => {
  const pendingReports = await Report.count({ where: { status: 'DIPROSES' } });

  const completedReports = await Report.count({
    where: {
      status: {
        [Op.in]: ['DITERIMA', 'DIABAIKAN']
      }
    }
  });

  const totalCustomers = await Nasabah.count();

  const pendingValidations = 0;

  return {
    pendingReports,
    completedReports,
    pendingValidations,
    totalCustomers
  };
};

export const verifyNasabahData = async (nama: string, email: string, password: string) => {
  const encryptedEmail = encrypt(email);
  const encryptedNama = encrypt(nama);
  
  const nasabah = await Nasabah.findOne({
    where: {
      nama: encryptedNama,
      email: encryptedEmail
    }
  });

  if (!nasabah) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, nasabah.password);
  return isMatch ? nasabah : null;
};

export const resetNasabahPassword = async (email: string, passwordBaru: string) => {
  const encryptedEmail = encrypt(email);
  const nasabah = await Nasabah.findOne({ where: { email: encryptedEmail } });

  if (!nasabah) {
    throw new Error('Nasabah tidak ditemukan');
  }

  const hashedPassword = await bcrypt.hash(passwordBaru, 10);
  nasabah.password = hashedPassword;

  await nasabah.save();

  return {
    nama: decrypt(nasabah.nama),
    email: email
  };
};
