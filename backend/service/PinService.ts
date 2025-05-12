// src/services/pinService.ts
import { Nasabah } from '../models/Nasabah';
import { encrypt } from '../enkripsi/Encryptor';

export const setPinNasabah = async (nasabahId: string, pin: string): Promise<Nasabah> => {
    const encryptedPin = encrypt(pin);
    const nasabah = await Nasabah.findOne({ where: { nasabah_id: nasabahId } });

    if (!nasabah) {
        throw new Error('Nasabah not found');
    }

    nasabah.pin = encryptedPin;
    await nasabah.save();

    return nasabah;
}
