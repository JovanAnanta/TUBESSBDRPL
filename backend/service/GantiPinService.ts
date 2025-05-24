import { decrypt, encrypt } from "../enkripsi/Encryptor";
import { Nasabah } from "../models/Nasabah";

export const gantiPin = async (nasabah_id: string, oldPin: string, newPin: string) => {
    const nasabah = await Nasabah.findByPk(nasabah_id);
    if (!nasabah) {
        throw new Error("Nasabah tidak ditemukan.");
    }

    const decryptedPin = decrypt(nasabah.pin);
    if (decryptedPin !== oldPin) {
        throw new Error("PIN lama salah.");
    }

    const encryptedNewPin = encrypt(newPin);
    await nasabah.update({ pin: encryptedNewPin });

    return { message: "PIN berhasil diganti." };
};
