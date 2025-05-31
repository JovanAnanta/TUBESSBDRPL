import { Nasabah } from '../models/Nasabah';
import { encrypt, decrypt } from '../enkripsi/Encryptor';

// Interface untuk response verifikasi PIN
export interface PinVerificationResult {
    success: boolean;
    message: string;
    remainingAttempts?: number;
    isBlocked?: boolean;
    nasabahData?: any;
}

// Cache untuk tracking PIN attempts (dalam production, gunakan Redis)
const pinAttempts = new Map<string, { count: number, timestamp: number }>();
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 jam dalam milliseconds
const MAX_ATTEMPTS = 3;

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

export const verifyPin = async (nasabahId: string, inputPin: string): Promise<PinVerificationResult> => {
    try {
        const attemptKey = `pin_attempts_${nasabahId}`;
        // If account has been reactivated in DB, clear previous attempts
        const nasabahDb = await Nasabah.findOne({ where: { nasabah_id: nasabahId } });
        if (nasabahDb && nasabahDb.status === 'AKTIF') {
            pinAttempts.delete(attemptKey);
        }
        // Cek apakah user sedang diblokir di memory
        const currentAttempt = pinAttempts.get(attemptKey);
        if (currentAttempt && currentAttempt.count >= MAX_ATTEMPTS) {
            const timeSinceBlock = Date.now() - currentAttempt.timestamp;
            if (timeSinceBlock < BLOCK_DURATION) {
                return {
                    success: false,
                    message: 'Akun Anda diblokir karena terlalu banyak percobaan PIN yang salah. Silakan coba lagi dalam 24 jam.',
                    isBlocked: true
                };
            } else {
                // Reset attempts setelah block period berakhir
                pinAttempts.delete(attemptKey);
            }
        }

        // Cari nasabah
        const nasabah = await Nasabah.findOne({ where: { nasabah_id: nasabahId } });
        
        if (!nasabah) {
            return {
                success: false,
                message: 'Nasabah tidak ditemukan'
            };
        }

        // Cek status akun
        if (nasabah.status !== 'AKTIF') {
            return {
                success: false,
                message: 'Akun Anda tidak aktif. Silakan hubungi customer service.'
            };
        }

        // Dekripsi PIN yang tersimpan dan bandingkan
        const decryptedStoredPin = decrypt(nasabah.pin);
        
        if (inputPin === decryptedStoredPin) {
            // PIN benar, reset attempts
            pinAttempts.delete(attemptKey);
            
            return {
                success: true,
                message: 'PIN berhasil diverifikasi',
                nasabahData: {
                    nasabah_id: nasabah.nasabah_id,
                    nama: decrypt(nasabah.nama),
                    noRekening: decrypt(nasabah.noRekening),
                    saldo: nasabah.saldo
                }
            };
        } else {
            // PIN salah, increment attempts
            const newCount = currentAttempt ? currentAttempt.count + 1 : 1;
            pinAttempts.set(attemptKey, {
                count: newCount,
                timestamp: Date.now()
            });

            const remainingAttempts = MAX_ATTEMPTS - newCount;
            
            if (newCount >= MAX_ATTEMPTS) {
                return {
                    success: false,
                    message: 'PIN salah. Akun Anda telah diblokir karena 3 kali percobaan PIN yang salah.',
                    remainingAttempts: 0,
                    isBlocked: true
                };
            } else {
                return {
                    success: false,
                    message: `PIN salah. Sisa percobaan: ${remainingAttempts}`,
                    remainingAttempts
                };
            }
        }
    } catch (error) {
        console.error('Error in verifyPin:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan sistem. Silakan coba lagi.'
        };
    }
}

export const blockAccount = async (nasabahId: string): Promise<{ success: boolean; message: string }> => {
    try {
        const nasabah = await Nasabah.findOne({ where: { nasabah_id: nasabahId } });
        
        if (!nasabah) {
            return {
                success: false,
                message: 'Nasabah tidak ditemukan'
            };
        }

        nasabah.status = 'TIDAK AKTIF';
        await nasabah.save();
        // Reset in-memory attempts so reactivation works immediately
        const attemptKey = `pin_attempts_${nasabahId}`;
        pinAttempts.delete(attemptKey);

        return {
            success: true,
            message: 'Akun berhasil diblokir'
        };
    } catch (error) {
        console.error('Error in blockAccount:', error);
        return {
            success: false,
            message: 'Terjadi kesalahan saat memblokir akun'
        };
    }
}

export const getRemainingAttempts = (nasabahId: string): number => {
    const attemptKey = `pin_attempts_${nasabahId}`;
    const currentAttempt = pinAttempts.get(attemptKey);
    
    if (!currentAttempt) {
        return MAX_ATTEMPTS;
    }
    
    return Math.max(0, MAX_ATTEMPTS - currentAttempt.count);
}

export const isAccountBlocked = (nasabahId: string): boolean => {
    const attemptKey = `pin_attempts_${nasabahId}`;
    const currentAttempt = pinAttempts.get(attemptKey);
    
    if (!currentAttempt || currentAttempt.count < MAX_ATTEMPTS) {
        return false;
    }
    
    const timeSinceBlock = Date.now() - currentAttempt.timestamp;
    return timeSinceBlock < BLOCK_DURATION;
}
