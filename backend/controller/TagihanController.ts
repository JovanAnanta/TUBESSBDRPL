import { Request, Response } from 'express';
import { TagihanService } from '../service/TagihanService';
import { getRemainingAttempts, isAccountBlocked } from '../service/PinService';

export class TagihanController {
    static async bayarTagihanAir(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user?.id;
        try {
            const nasabahId = (req as any).user?.id;
            const { nomorTagihan, jumlahBayar, pin } = req.body;

            // Validasi input
            if (!nasabahId) {
                res.status(401).json({ message: 'Unauthorized: User ID tidak ditemukan' });
                return;
            }

            if (!nomorTagihan || !jumlahBayar || !pin) {
                res.status(400).json({
                    message: 'Nomor tagihan, jumlah bayar, dan PIN harus diisi'
                });
                return;
            }            if (jumlahBayar <= 0) {
                res.status(400).json({
                    message: 'Jumlah pembayaran harus lebih dari 0'
                });
                return;
            }

            // Validasi prefix untuk tagihan air - harus PDAM atau numeric only
            if (nomorTagihan.toUpperCase().startsWith('PLN')) {
                res.status(400).json({
                    message: 'PLN prefix tidak valid untuk tagihan air. Gunakan prefix PDAM atau nomor tanpa prefix.'
                });
                return;
            }

            // Panggil service bayarTagihan
            const result = await TagihanService.bayarTagihan(nasabahId, nomorTagihan, jumlahBayar, pin, 'AIR');
            res.status(200).json(result);
        } catch (error: any) {
            const responseBody: any = { success: false, message: error.message };
            // Sertakan info percobaan PIN
            const remaining = getRemainingAttempts(userId);
            const blocked = isAccountBlocked(userId);
            if (remaining !== undefined) responseBody.remainingAttempts = remaining;
            if (blocked !== undefined) responseBody.isBlocked = blocked;
            console.error('Error di bayarTagihan:', error);
            res.status(400).json(responseBody);
        }
    }

    /**
     * Handle pembayaran tagihan listrik
     * POST /api/tagihan/listrik
     */    static async bayarTagihanListrik(req: Request, res: Response): Promise<void> {
        const userId = (req as any).user?.id;
        try {
            const nasabahId = (req as any).user?.id;
            const { nomorTagihan, jumlahBayar, pin } = req.body;

            // Validasi input
            if (!nasabahId) {
                res.status(401).json({ message: 'Unauthorized: User ID tidak ditemukan' });
                return;
            }

            if (!nomorTagihan || !jumlahBayar || !pin) {
                res.status(400).json({
                    message: 'Nomor tagihan, jumlah bayar, dan PIN harus diisi'
                });
                return;
            }            if (jumlahBayar <= 0) {
                res.status(400).json({
                    message: 'Jumlah pembayaran harus lebih dari 0'
                });
                return;
            }

            // Validasi prefix untuk tagihan listrik - harus PLN atau numeric only
            if (nomorTagihan.toUpperCase().startsWith('PDAM')) {
                res.status(400).json({
                    message: 'PDAM prefix tidak valid untuk tagihan listrik. Gunakan prefix PLN atau nomor tanpa prefix.'
                });
                return;
            }

            // Panggil service bayarTagihan
            const result = await TagihanService.bayarTagihan(nasabahId, nomorTagihan, jumlahBayar, pin, 'LISTRIK');
            res.status(200).json(result);
        } catch (error: any) {
            const responseBody: any = { success: false, message: error.message };
            // Sertakan info percobaan PIN
            const remaining = getRemainingAttempts(userId);
            const blocked = isAccountBlocked(userId);
            if (remaining !== undefined) responseBody.remainingAttempts = remaining;
            if (blocked !== undefined) responseBody.isBlocked = blocked;
            console.error('Error di bayarTagihan:', error);
            res.status(400).json(responseBody);
        }
    }

    /**
     * Get dummy bill amount untuk testing
     * GET /api/tagihan/:type/amount/:nomorTagihan
     */    static async getBillAmount(req: Request, res: Response): Promise<void> {
        try {
            const { type, nomorTagihan } = req.params;

            if (!['air', 'listrik'].includes(type.toLowerCase())) {
                res.status(400).json({
                    message: 'Jenis tagihan tidak valid. Gunakan "air" atau "listrik"'
                });
                return;
            }

            // Generate dummy amount berdasarkan nomor tagihan
            const amount = TagihanService.generateDummyAmount(nomorTagihan);
            const customerName = `Pelanggan ${nomorTagihan.slice(-4)}`;

            res.status(200).json({
                message: 'Data tagihan ditemukan',
                data: {
                    nomorTagihan,
                    amount,
                    customerName,
                    type: type.toUpperCase(),
                    status: 'BELUM_LUNAS'
                }
            });

        } catch (error: any) {
            console.error('Error get bill amount:', error);
            res.status(500).json({
                message: 'Terjadi kesalahan saat mengambil data tagihan',
                error: error.message
            });
        }
    }

    static async cekKelayakanBayar(req: Request, res: Response): Promise<void> {
        try {
            const nasabahId = (req as any).user?.id;
            const { type, nomorTagihan } = req.params;

            // Validasi input
            if (!nasabahId) {
                console.log('Error: Unauthorized - no user ID');
                res.status(401).json({ message: 'Unauthorized: User ID tidak ditemukan' });
                return;
            }

            if (!['air', 'listrik'].includes(type.toLowerCase())) {
                console.log('Error: Invalid type');
                res.status(400).json({
                    message: 'Jenis tagihan tidak valid. Gunakan "air" atau "listrik"'
                });
                return;
            }

            if (!nomorTagihan) {
                console.log('Error: No nomor tagihan');
                res.status(400).json({
                    message: 'Nomor tagihan diperlukan'
                });
                return;
            }

            // Convert type to uppercase for service
            const tagihanType = type.toUpperCase() as 'AIR' | 'LISTRIK';
            console.log('Calling service with type:', tagihanType);

            // Cek kelayakan pembayaran
            const eligibilityResult = await TagihanService.cekKelayakanBayarTagihan(
                nasabahId, 
                nomorTagihan, 
                tagihanType
            );

            console.log('Service result:', eligibilityResult);

            res.status(200).json({
                success: true,
                eligible: eligibilityResult.eligible,
                message: eligibilityResult.message,
                lastPaymentDate: eligibilityResult.lastPaymentDate,
                data: {
                    nomorTagihan,
                    type: tagihanType,
                    canPay: eligibilityResult.eligible
                }
            });

        } catch (error: any) {
            console.error('Error cek kelayakan bayar:', error);
            res.status(500).json({
                success: false,
                message: 'Terjadi kesalahan saat memeriksa kelayakan pembayaran',
                error: error.message
            });
        }
    }
}