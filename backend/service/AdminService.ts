import { encrypt, decrypt } from '../enkripsi/Encryptor';
import { Admin } from '../models/Admin';
import bcrypt from 'bcryptjs';

export const loginAdminService = async (email: string, password: string) => {
  const encryptedEmail = encrypt(email);
  const admin = await Admin.findOne({ where: { email: encryptedEmail } });

  if (!admin) {
    throw new Error('Admin tidak ditemukan');
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new Error('Password salah');
  }

  return admin;
};
