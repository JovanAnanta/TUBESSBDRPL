import { Sequelize, QueryTypes } from 'sequelize';
import { Nasabah } from '../models/Nasabah';
import { Transaksi } from '../models/Transaksi';
import { Tagihan } from '../models/Tagihan';
import { Debit } from '../models/Debit';
import * as pinService from './PinService';
import { v4 as uuidv4 } from 'uuid';

export class TagihanService {
    
    /**
     * Proses pembayaran tagihan (air/listrik)
     */
    static async bayarTagihan(
        nasabahId: string, 
        nomorTagihan: string, 
        jumlahBayar: number, 
        pin: string, 
        statusTagihanType: 'AIR' | 'LISTRIK'
    ) {
        
        let transaction;
        
        try {
            transaction = await Nasabah.sequelize!.transaction();
            
            // 1. Validasi input
            if (!nasabahId) {
                throw new Error('Nasabah ID diperlukan');
            }
            if (!nomorTagihan) {
                throw new Error('Nomor tagihan diperlukan');
            }
            if (!pin) {
                throw new Error('PIN diperlukan');
            }
            if (jumlahBayar <= 0) {
                throw new Error('Jumlah pembayaran harus lebih dari 0');
            }

            // 2. Validasi format nomor tagihan
            const isValidFormat = this.validateNomorTagihan(nomorTagihan, statusTagihanType);
            if (!isValidFormat) {
                throw new Error(`Format nomor tagihan ${statusTagihanType.toLowerCase()} tidak valid`);
            }

            // 3. Cari nasabah
            const nasabah = await Nasabah.findByPk(nasabahId, { transaction });
            if (!nasabah) {
                throw new Error('Nasabah tidak ditemukan');
            }

            // 4. Cek status nasabah
            if (nasabah.status !== 'AKTIF') {
                throw new Error('Akun tidak aktif. Silakan hubungi customer service');
            }

            // 5. Verifikasi PIN menggunakan PinService
            try {
                const pinVerificationResult = await pinService.verifyPin(nasabahId, pin);
                if (!pinVerificationResult.success) {
                    throw new Error(pinVerificationResult.message || 'PIN tidak valid');
                }
            } catch (pinError) {
                throw new Error('PIN tidak valid');
            }

            // 6. Cek saldo mencukupi
            if (nasabah.saldo < jumlahBayar) {
                throw new Error(`Saldo tidak mencukupi. Saldo Anda: Rp ${nasabah.saldo.toLocaleString()}, Tagihan: Rp ${jumlahBayar.toLocaleString()}`);
            }

            // 7. Buat transaksi utama
            const transaksiId = uuidv4();
            const keterangan = `Pembayaran Tagihan ${statusTagihanType} - ${nomorTagihan}`;
            
            const transaksi = await Transaksi.create({
                transaksi_id: transaksiId,
                nasabah_id: nasabahId,
                transaksiType: 'KELUAR',
                tanggalTransaksi: new Date(),
                keterangan
            }, { transaction });

            // 8. Buat record debit (pengeluaran)
            const debitId = uuidv4();
            
            await Debit.create({
                debit_id: debitId,
                transaksi_id: transaksiId,
                jumlahSaldoBerkurang: jumlahBayar
            }, { transaction });

            // 9. Buat record tagihan
            const tagihanId = uuidv4();
            
            await Tagihan.create({
                tagihan_id: tagihanId,
                transaksi_id: transaksiId,
                statusTagihanType,
                nomorTagihan
            }, { transaction });

            // 10. Update saldo nasabah
            const saldoBaru = nasabah.saldo - jumlahBayar;
            
            await nasabah.update({ 
                saldo: saldoBaru 
            }, { transaction });

            // 11. Commit transaction
            await transaction.commit();
            
            return {
                success: true,
                message: `Pembayaran tagihan ${statusTagihanType.toLowerCase()} berhasil`,
                data: {
                    transaksi_id: transaksiId,
                    nasabah_id: nasabahId,
                    statusTagihanType,
                    nomorTagihan,
                    jumlahBayar,
                    saldoSebelum: nasabah.saldo,
                    saldoSesudah: saldoBaru,
                    tanggalTransaksi: transaksi.tanggalTransaksi,
                    keterangan
                }
            };

        } catch (error) {
            if (transaction) {
                try {
                    await transaction.rollback();
                } catch (rollbackError) {
                }
            }
            
            throw error;
        }
    }

    /**
     * Generate dummy amount berdasarkan nomor tagihan untuk testing
     */
    static generateDummyAmount(nomorTagihan: string): number {
        // Gunakan hash sederhana dari nomor tagihan untuk konsistensi
        let hash = 0;
        for (let i = 0; i < nomorTagihan.length; i++) {
            const char = nomorTagihan.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Generate amount antara 50,000 sampai 500,000
        const minAmount = 50000;
        const maxAmount = 500000;
        const range = maxAmount - minAmount;
        const amount = minAmount + (Math.abs(hash) % range);
        
        // Round ke ribuan terdekat
        return Math.round(amount / 1000) * 1000;
    }

    /**
     * Validasi format nomor tagihan
     */
    static validateNomorTagihan(nomorTagihan: string, type: 'AIR' | 'LISTRIK'): boolean {
        
        if (!nomorTagihan || typeof nomorTagihan !== 'string') {
            return false;
        }

        // Remove any spaces or special characters
        const cleanNumber = nomorTagihan.replace(/\s+/g, '');
        
        // Untuk air: minimal 8 digit, maksimal 15 digit
        // Untuk listrik: minimal 10 digit, maksimal 15 digit
        const minLength = type === 'AIR' ? 8 : 10;
        const maxLength = 15;
        
        const lengthValid = cleanNumber.length >= minLength && cleanNumber.length <= maxLength;
        const formatValid = /^\d+$/.test(cleanNumber);
        
        return lengthValid && formatValid;
    }

    /**
     * Format nomor tagihan untuk display
     */
    static formatNomorTagihan(nomorTagihan: string, type: 'AIR' | 'LISTRIK'): string {
        const cleanNumber = nomorTagihan.replace(/\s+/g, '');
        
        if (type === 'AIR') {
            // Format: XXXX-XXXX atau XXXX-XXXX-XXX
            return cleanNumber.replace(/(\d{4})(\d{4})(\d{0,3})/, '$1-$2-$3').replace(/-$/, '');
        } else {
            // Format: XXXX-XXXX-XXXX atau XXXX-XXXX-XXX
            return cleanNumber.replace(/(\d{4})(\d{4})(\d{0,4})/, '$1-$2-$3').replace(/-$/, '');
        }
    }

    /**
     * Validate input untuk pembayaran tagihan
     */
    static validatePaymentInput(data: {
        nasabahId: string;
        nomorTagihan: string;
        pin: string;
        type: 'AIR' | 'LISTRIK';
    }): { valid: boolean; message?: string } {
        const { nasabahId, nomorTagihan, pin, type } = data;

        if (!nasabahId) {
            return { valid: false, message: 'Nasabah ID diperlukan' };
        }

        if (!nomorTagihan) {
            return { valid: false, message: 'Nomor tagihan diperlukan' };
        }

        if (!pin) {
            return { valid: false, message: 'PIN diperlukan' };
        }

        if (!['AIR', 'LISTRIK'].includes(type)) {
            return { valid: false, message: 'Tipe tagihan tidak valid' };
        }

        if (!/^\d{6}$/.test(pin)) {
            return { valid: false, message: 'PIN harus 6 digit angka' };
        }

        if (!this.validateNomorTagihan(nomorTagihan, type)) {
            return { valid: false, message: `Format nomor tagihan ${type.toLowerCase()} tidak valid` };
        }

        return { valid: true };
    }
}
