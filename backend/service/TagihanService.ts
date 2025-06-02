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
            } catch {
                throw new Error('PIN tidak valid');
            }

            // 6. Cek saldo mencukupi
            if (nasabah.saldo < jumlahBayar) {
                throw new Error(`Saldo tidak mencukupi. Saldo Anda: Rp ${nasabah.saldo.toLocaleString()}, Tagihan: Rp ${jumlahBayar.toLocaleString()}`);
            }

            // 7. Buat transaksi utama
            const transaksiId = uuidv4();
            // Use fixed description for tagihan
            const keterangan = `TAGIHAN ${statusTagihanType}`;
            
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
                await transaction.rollback();
            }
            throw error;
        }
    }/**
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
     * Get informasi tagihan berdasarkan nomor untuk preview
     */
    static async getTagihanInfo(nomorTagihan: string, type: 'AIR' | 'LISTRIK') {
        try {
            // Validasi format nomor tagihan
            if (!this.validateNomorTagihan(nomorTagihan, type)) {
                throw new Error(`Format nomor tagihan ${type.toLowerCase()} tidak valid`);
            }

            // Generate dummy data untuk testing
            const amount = this.generateDummyAmount(nomorTagihan);
            const dummyCustomerData = this.generateDummyCustomerData(nomorTagihan, type);

            return {
                success: true,
                data: {
                    nomorTagihan,
                    type,
                    amount,
                    ...dummyCustomerData,
                    dueDate: this.generateDummyDueDate(),
                    status: 'BELUM LUNAS'
                }
            };
        } catch (error) {
            console.error('Error in getTagihanInfo:', error);
            throw error;
        }
    }

    /**
     * Generate dummy customer data untuk testing
     */
    private static generateDummyCustomerData(nomorTagihan: string, type: 'AIR' | 'LISTRIK') {
        const names = ['Ahmad Wijaya', 'Siti Nurhaliza', 'Budi Santoso', 'Dewi Sartika', 'Joko Widodo'];
        const addresses = [
            'Jl. Merdeka No. 123, Jakarta',
            'Jl. Sudirman No. 456, Bandung', 
            'Jl. Diponegoro No. 789, Surabaya',
            'Jl. Gatot Subroto No. 321, Yogyakarta',
            'Jl. Ahmad Yani No. 654, Medan'
        ];

        // Use nomor tagihan untuk generate data yang konsisten
        const index = parseInt(nomorTagihan.slice(-1)) % names.length;
        
        return {
            customerName: names[index],
            customerAddress: addresses[index],
            periode: type === 'AIR' ? this.generateWaterPeriod() : this.generateElectricPeriod(),
            tarif: type === 'AIR' ? 'R1/1300VA' : 'R1M/2200VA'
        };
    }

    /**
     * Generate dummy due date
     */
    private static generateDummyDueDate(): string {
        const today = new Date();
        const dueDate = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now
        return dueDate.toISOString().split('T')[0];
    }

    /**
     * Generate dummy water period
     */
    private static generateWaterPeriod(): string {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        const currentMonth = new Date().getMonth();
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        return `${months[prevMonth]} ${new Date().getFullYear()}`;
    }

    /**
     * Generate dummy electric period  
     */
    private static generateElectricPeriod(): string {
        const currentDate = new Date();
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
        return `${prevMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
    }    /**
     * Get riwayat pembayaran tagihan nasabah
     */
    static async getRiwayatTagihan(nasabahId: string, limit: number = 10) {
        try {
            if (!nasabahId) {
                throw new Error('Nasabah ID diperlukan');
            }

            const riwayat = await Transaksi.findAll({
                where: { 
                    nasabah_id: nasabahId,
                    transaksiType: 'KELUAR'
                },
                include: [{
                    model: Tagihan,
                    required: true
                }, {
                    model: Debit,
                    required: true
                }],
                order: [['tanggalTransaksi', 'DESC']],
                limit
            });

            return {
                success: true,
                data: riwayat.map(transaksi => ({
                    transaksi_id: transaksi.transaksi_id,
                    tanggalTransaksi: transaksi.tanggalTransaksi,
                    keterangan: transaksi.keterangan,
                    statusTagihanType: transaksi.Tagihan?.statusTagihanType,
                    nomorTagihan: transaksi.Tagihan?.nomorTagihan,
                    jumlahBayar: transaksi.Debit?.jumlahSaldoBerkurang,
                    status: 'BERHASIL'
                }))
            };

        } catch (error) {
            console.error('Error in getRiwayatTagihan:', error);
            throw new Error(`Gagal mengambil riwayat tagihan: ${error}`);
        }
    }

    /**
     * Cek apakah tagihan sudah pernah dibayar
     */
    static async isTagihanSudahDibayar(nasabahId: string, nomorTagihan: string, type: 'AIR' | 'LISTRIK'): Promise<boolean> {
        try {
            const existingPayment = await Transaksi.findOne({
                where: {
                    nasabah_id: nasabahId
                },
                include: [{
                    model: Tagihan,
                    where: {
                        nomorTagihan,
                        statusTagihanType: type
                    }
                }]
            });

            return !!existingPayment;
        } catch (error) {
            console.error('Error checking payment history:', error);
            return false;
        }
    }    /**
     * Get statistik pembayaran tagihan nasabah
     */
    static async getStatistikTagihan(nasabahId: string) {
        try {            // Total transaksi tagihan
            const totalTransaksi = await Transaksi.count({
                where: { nasabah_id: nasabahId, transaksiType: 'KELUAR' },
                include: [{ model: Tagihan, required: true }]
            });

            // Total nominal yang dibayar - menggunakan Sequelize ORM findAll dengan attributes
            const totalNominalData = await Transaksi.findAll({
                where: { 
                    nasabah_id: nasabahId, 
                    transaksiType: 'KELUAR' 
                },
                include: [{
                    model: Tagihan,
                    required: true
                }, {
                    model: Debit,
                    required: true,
                    attributes: ['jumlahSaldoBerkurang']
                }],
                attributes: []
            });

            // Calculate total nominal from the results
            const totalNominal = totalNominalData.reduce((sum, transaksi) => {
                return sum + (transaksi.Debit?.jumlahSaldoBerkurang || 0);
            }, 0);

            // Jumlah tagihan air
            const tagihanAir = await Transaksi.count({
                where: { nasabah_id: nasabahId, transaksiType: 'KELUAR' },
                include: [{ 
                    model: Tagihan, 
                    where: { statusTagihanType: 'AIR' },
                    required: true 
                }]
            });

            // Jumlah tagihan listrik
            const tagihanListrik = await Transaksi.count({
                where: { nasabah_id: nasabahId, transaksiType: 'KELUAR' },
                include: [{ 
                    model: Tagihan, 
                    where: { statusTagihanType: 'LISTRIK' },
                    required: true 
                }]
            });            return {
                success: true,
                data: {
                    totalTransaksi: totalTransaksi || 0,
                    totalNominal: totalNominal || 0,
                    totalTagihanAir: tagihanAir || 0,
                    totalTagihanListrik: tagihanListrik || 0,
                    rataRataNominal: totalTransaksi > 0 ? Math.round(totalNominal / totalTransaksi) : 0
                }
            };
        } catch (error) {
            console.error('Error in getStatistikTagihan:', error);
            throw new Error(`Gagal mengambil statistik tagihan: ${error}`);
        }
    }    /**
     * Validasi format nomor tagihan
     */
    static validateNomorTagihan(nomorTagihan: string, type: 'AIR' | 'LISTRIK'): boolean {
        if (!nomorTagihan || typeof nomorTagihan !== 'string') return false;
        
        const upperCaseNumber = nomorTagihan.trim().toUpperCase();
        
        // Validasi prefix restrictions
        if (type === 'AIR' && upperCaseNumber.startsWith('PLN')) {
            return false; // PLN prefix not allowed for water bills
        }
        if (type === 'LISTRIK' && upperCaseNumber.startsWith('PDAM')) {
            return false; // PDAM prefix not allowed for electricity bills
        }
        
        let cleanNumber = nomorTagihan.trim();
        
        // Strip valid prefixes
        if (type === 'LISTRIK' && /^PLN/i.test(cleanNumber)) {
            cleanNumber = cleanNumber.replace(/^PLN/i, '');
        }
        if (type === 'AIR' && /^PDAM/i.test(cleanNumber)) {
            cleanNumber = cleanNumber.replace(/^PDAM/i, '');
        }
        
        // Remove any spaces
        cleanNumber = cleanNumber.replace(/\s+/g, '');
        
        // Must be numeric
        if (!/^\d+$/.test(cleanNumber)) return false;
        
        // Minimum length 8 digits for both types, max 15
        const minLength = 8;
        const maxLength = 15;
        return cleanNumber.length >= minLength && cleanNumber.length <= maxLength;
    }

    /**
     * Format nomor tagihan untuk display
     */
    static formatNomorTagihan(nomorTagihan: string, type: 'AIR' | 'LISTRIK'): string {
    let input = nomorTagihan.trim();
    // Detect and preserve 'PDAM' prefix for water bills
    let prefix = '';
    if (type === 'LISTRIK' && /^PLN/i.test(input)) {
        prefix = 'PLN ';
        input = input.replace(/^PLN/i, '');
    }
    if (type === 'AIR' && /^PDAM/i.test(input)) {
        prefix = 'PDAM ';
        input = input.replace(/^PDAM/i, '');
    }
    const cleanNumber = input.replace(/\s+/g, '');
    
    let formatted = '';
    if (type === 'AIR') {
        formatted = cleanNumber.replace(/(\d{4})(\d{4})(\d{0,3})/, '$1-$2-$3').replace(/-$/, '');
    } else {
        formatted = cleanNumber.replace(/(\d{4})(\d{4})(\d{0,4})/, '$1-$2-$3').replace(/-$/, '');
    }
    return prefix + formatted;
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

    /**
     * Cek kelayakan pembayaran tagihan berdasarkan aturan 1 bulan
     */    static async cekKelayakanBayarTagihan(
        nasabahId: string, 
        nomorTagihan: string, 
        type: 'AIR' | 'LISTRIK'
    ): Promise<{ eligible: boolean; message?: string; lastPaymentDate?: Date }> {
        try {
            // Validasi input
            if (!nasabahId) {
                return { eligible: false, message: 'Nasabah ID diperlukan' };
            }
            if (!nomorTagihan) {
                return { eligible: false, message: 'Nomor tagihan diperlukan' };
            }
            if (!['AIR', 'LISTRIK'].includes(type)) {
                return { eligible: false, message: 'Tipe tagihan tidak valid' };
            }

            // Validasi format nomor tagihan
            if (!this.validateNomorTagihan(nomorTagihan, type)) {
                return { eligible: false, message: `Format nomor tagihan ${type.toLowerCase()} tidak valid` };
            }

            // Cari pembayaran terakhir untuk nomor tagihan yang sama
            const lastPayment = await Transaksi.findOne({
                where: {
                    nasabah_id: nasabahId
                },
                include: [{
                    model: Tagihan,
                    where: {
                        nomorTagihan,
                        statusTagihanType: type
                    }
                }],
                order: [['tanggalTransaksi', 'DESC']]
            });

            // Jika belum pernah bayar, maka boleh bayar
            if (!lastPayment) {
                return { eligible: true };
            }

            // Hitung selisih waktu dengan pembayaran terakhir
            const lastPaymentDate = new Date(lastPayment.tanggalTransaksi);
            const currentDate = new Date();
            const timeDifference = currentDate.getTime() - lastPaymentDate.getTime();
            const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

            // Aturan 1 bulan = 30 hari
            const restrictionPeriod = 30;

            if (daysDifference < restrictionPeriod) {
                const remainingDays = restrictionPeriod - daysDifference;
                return {
                    eligible: false,
                    message: `Tagihan ${nomorTagihan} sudah dibayar pada ${lastPaymentDate.toLocaleDateString('id-ID')}. Anda dapat membayar tagihan yang sama setelah ${remainingDays} hari lagi.`,
                    lastPaymentDate
                };
            }

            // Jika sudah lebih dari 30 hari, boleh bayar lagi
            return { eligible: true, lastPaymentDate };

        } catch (error) {
            console.error('Error in cekKelayakanBayarTagihan:', error);
            return { 
                eligible: false, 
                message: 'Terjadi kesalahan saat memeriksa kelayakan pembayaran' 
            };
        }
    }
}