import bcrypt from 'bcrypt';
import { decrypt } from '../enkripsi/Encryptor';
import { Nasabah } from '../models/Nasabah';

export const gantiPassword = async (
    nasabah_id: string,
    oldPassword: string,
    newPassword: string
) => {
    const nasabah = await Nasabah.findByPk(nasabah_id);
    if (!nasabah) throw new Error('Nasabah tidak ditemukan');

    const currentHashed = nasabah.password;
    let isMatch = false;

    if (currentHashed.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(oldPassword, currentHashed);
    } else {
        const decrypted = decrypt(currentHashed);
        isMatch = decrypted === oldPassword;
    }

    if (!isMatch) {
        throw new Error('Password lama tidak cocok');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    nasabah.password = hashedNewPassword;
    await nasabah.save();

    return {
        id: nasabah.nasabah_id,
        email: nasabah.email,
        nama: nasabah.nama,
    };
};
