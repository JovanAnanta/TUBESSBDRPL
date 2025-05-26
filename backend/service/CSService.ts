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


export const verifyNasabahForReset = async (nama: string, email: string, noRekening: string) => {
  try {
    const nasabahs = await Nasabah.findAll();
    
    for (const nasabah of nasabahs) {
      // Check if all three fields match
      const decryptedNama = decrypt(nasabah.nama);
      const decryptedEmail = decrypt(nasabah.email);
      const decryptedNoRekening = decrypt(nasabah.noRekening);
      
      if (
        decryptedNama.toLowerCase() === nama.toLowerCase() &&
        decryptedEmail.toLowerCase() === email.toLowerCase() &&
        decryptedNoRekening === noRekening
      ) {
        return nasabah;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying nasabah:', error);
    throw error;
  }
};

export const resetNasabahPassword = async (
  email: string, 
  nama: string, 
  noRekening: string, 
  newPassword: string
) => {
  try {
    // First verify the nasabah
    const nasabah = await verifyNasabahForReset(nama, email, noRekening);
    
    if (!nasabah) {
      return null;
    }
    
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the password
    nasabah.password = hashedPassword;
    await nasabah.save();
    
    return nasabah;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};