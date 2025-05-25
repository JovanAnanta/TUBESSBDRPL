import { encrypt } from '../enkripsi/Encryptor';
import { LayananPelanggan } from '../models/LayananPelanggan';
import { Report } from '../models/Report';
import { Nasabah } from '../models/Nasabah';
import { Op } from 'sequelize';

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
  const encryptedPassword = encrypt(password);

  console.log('MENCARI NASABAH DENGAN:');
  console.log('Nama:', nama);
  console.log('Email (terenkripsi):', encryptedEmail);
  console.log('Password (terenkripsi):', encryptedPassword);

  const nasabah = await Nasabah.findOne({
    where: {
      nama,
      email: encryptedEmail,
      password: encryptedPassword
    }
  });

  return nasabah;
};
