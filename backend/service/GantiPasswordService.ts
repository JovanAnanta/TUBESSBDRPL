    import { decrypt, encrypt } from '../enkripsi/Encryptor';
import { Nasabah } from '../models/Nasabah';

    export const gantiPassword = async (
    nasabah_id: string,
    oldPassword: string,
    newPassword: string
    ) => {
    const nasabah = await Nasabah.findByPk(nasabah_id);
    if (!nasabah) throw new Error('Nasabah tidak ditemukan');

    const decryptedPassword = decrypt(nasabah.password);

    if (decryptedPassword !== oldPassword) {
        throw new Error('Password lama tidak sesuai');
    }

    nasabah.password = encrypt(newPassword);
    await nasabah.save();

    return { nasabah_id: nasabah.nasabah_id, email: nasabah.email };
    };
