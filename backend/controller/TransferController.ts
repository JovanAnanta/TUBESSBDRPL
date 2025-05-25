import { Request, Response } from "express";
import { Nasabah } from "../models/Nasabah";
import { Transaksi } from "../models/Transaksi";
import { Credit } from "../models/Credit";
import { Debit } from "../models/Debit";
import { Transfer } from "../models/Transfer";
import * as pinService from '../service/PinService';
import { encrypt } from '../enkripsi/Encryptor';
import { v4 as uuidv4 } from 'uuid';

// Gunakan endpoint: PUT /api/user/top-up?nasabahId=xxx
export const topUp = async (req: Request, res: Response): Promise<void> => {
    // Ambil nasabahId dari params atau query
    const nasabahId = req.params.nasabahId || req.query.nasabahId;
    const { amount } = req.body;

    try {
        if (!nasabahId || amount === undefined) {
            res.status(400).json({
                success: false,
                message: 'nasabahId dan amount harus diisi'
            });
            return;
        }

        // Validasi amount
        if (typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({
                success: false,
                message: 'Amount harus berupa angka positif'
            });
            return;
        }

        const nasabah = await Nasabah.findOne({ where: { nasabah_id: nasabahId } });
        if (!nasabah) {
            res.status(404).json({
                success: false,
                message: 'Nasabah tidak ditemukan'
            });
            return;
        }

        if (amount > 10000000) {
            res.status(400).json({
                success: false,
                message: 'Jumlah top up tidak boleh lebih dari 10.000.000'
            });
            return;
        }

        // Update saldo nasabah
        
        // Buat record transaksi dan credit untuk top-up
        const transaksi = await Transaksi.create({
            nasabah_id: nasabahId,
            transaksiType: 'MASUK',
            tanggalTransaksi: new Date()
        });
        await Credit.create({
            credit_id: uuidv4(),
            transaksi_id: transaksi.transaksi_id,
            jumlahSaldoBertambah: amount
        });
        
        nasabah.saldo += amount;
        await nasabah.save();

        res.status(200).json({
            success: true,
            message: `Top up sebesar ${amount} untuk nasabah ${nasabahId} berhasil`,
            data: { transaksi_id: transaksi.transaksi_id }
        });
    } catch (error) {
        console.error('Error in topUp controller:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memproses top up'
        });
    }
}

// Handler untuk E-Receipt
export const getEReceipt = async (req: Request, res: Response): Promise<void> => {
    const { transaksiId } = req.params;
    try {
        if (!transaksiId) {
            res.status(400).json({ success: false, message: 'transaksiId harus diisi' });
            return;
        }
        const transaksi = await Transaksi.findByPk(transaksiId);
        if (!transaksi) {
            res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
            return;
        }
        // Fetch related records
        const credit = await Credit.findOne({ where: { transaksi_id: transaksiId } });
        const debit = await Debit.findOne({ where: { transaksi_id: transaksiId } });
        const transferRec = await Transfer.findOne({ where: { transaksi_id: transaksiId } });
        // Determine jenis and nominal
        let jenis: string;
        let nominal: number;
        let detail: any = null;
        if (transaksi.transaksiType === 'MASUK') {
            if (transferRec && credit) {
                jenis = 'Transfer Masuk';
                nominal = credit.jumlahSaldoBertambah;
                detail = { fromRekening: transferRec.noRekening, berita: transferRec.berita };
            } else if (credit) {
                jenis = 'Top-up';
                nominal = credit.jumlahSaldoBertambah;
            } else {
                jenis = 'Masuk';
                nominal = 0;
            }
        } else {
            if (transferRec && debit) {
                jenis = 'Transfer Keluar';
                nominal = debit.jumlahSaldoBerkurang;
                detail = { toRekening: transferRec.noRekening, berita: transferRec.berita };
            } else if (debit) {
                jenis = 'Keluar';
                nominal = debit.jumlahSaldoBerkurang;
            } else {
                jenis = 'Keluar';
                nominal = credit ? credit.jumlahSaldoBertambah : 0;
            }
        }

         res.status(200).json({
             success: true,
             data: {
                 transaksi_id: transaksi.transaksi_id,
                 tanggalTransaksi: transaksi.tanggalTransaksi,
                transaksiType: transaksi.transaksiType as 'MASUK' | 'KELUAR',
                jenis,
                nominal,
                detail
             }
         });
     } catch (error) {
         console.error('Error in getEReceipt controller:', error);
         res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem' });
     }
}

// Combined handler: verify PIN then top-up
export const topUpWithPin = async (req: Request, res: Response): Promise<void> => {
    const { nasabahId, amount, pin } = req.body;
    try {
        // Validate input
        if (!nasabahId || amount === undefined || !pin) {
            res.status(400).json({ success: false, message: 'nasabahId, amount, dan pin harus diisi' });
            return;
        }
        // Verify PIN
        const verifyResult = await pinService.verifyPin(nasabahId, pin);
        if (!verifyResult.success) {
            res.status(401).json({ success: false, message: 'PIN salah' });
            return;
        }
        // Perform top-up (reuse existing logic)
        const nasabah = await Nasabah.findOne({ where: { nasabah_id: nasabahId } });
        if (!nasabah) {
            res.status(404).json({ success: false, message: 'Nasabah tidak ditemukan' });
            return;
        }
        if (typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({ success: false, message: 'Amount harus positif' });
            return;
        }

        if (amount > 10000000) {
            res.status(400).json({ success: false, message: 'Jumlah top up tidak boleh lebih dari 10.000.000' });
            return;
        }
        // Update saldo and record transaksi
        nasabah.saldo += amount;
        await nasabah.save();
        const transaksi = await Transaksi.create({ nasabah_id: nasabahId, transaksiType: 'MASUK', tanggalTransaksi: new Date() });
        await Credit.create({ credit_id: uuidv4(), transaksi_id: transaksi.transaksi_id, jumlahSaldoBertambah: amount });
        res.status(200).json({ success: true, data: { transaksi_id: transaksi.transaksi_id } });
    } catch (error) {
        console.error('Error in topUpWithPin controller:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses top up dengan PIN' });
    }
}

// Handler untuk Transfer dengan PIN
export const transferWithPin = async (req: Request, res: Response): Promise<void> => {
    const { nasabahId, toRekening, amount, note, pin } = req.body;
    try {
        if (!nasabahId || !toRekening || amount === undefined || !pin) {
            res.status(400).json({ success: false, message: 'nasabahId, toRekening, amount, note, dan pin harus diisi' });
            return;
        }
        // Verifikasi PIN
        const verifyResult = await pinService.verifyPin(nasabahId, pin);
        if (!verifyResult.success) {
            res.status(401).json({ success: false, message: verifyResult.message });
            return;
        }
        // Cari sumber dan tujuan nasabah
        const source = await Nasabah.findOne({ where: { nasabah_id: nasabahId } });
        // Encrypt tujuan rekening untuk pencarian di DB
        const encryptedRekening = encrypt(toRekening);
        const target = await Nasabah.findOne({ where: { noRekening: encryptedRekening } });
        if (!source) {
            res.status(404).json({ success: false, message: 'Nasabah sumber tidak ditemukan' });
            return;
        }
        if (!target) {
            res.status(404).json({ success: false, message: 'No rekening tujuan tidak ditemukan' });
            return;
        }
        if (source.saldo < amount) {
            res.status(400).json({ success: false, message: 'Saldo tidak mencukupi' });
            return;
        }
        // Update saldo
        source.saldo -= amount;
        target.saldo += amount;
        await source.save();
        await target.save();
        // Buat transaksi debit dan credit untuk sumber
        const transaksi = await Transaksi.create({
            nasabah_id: nasabahId,
            transaksiType: 'KELUAR',
            tanggalTransaksi: new Date(),
        });
        await Debit.create({
            debit_id: uuidv4(),
            transaksi_id: transaksi.transaksi_id,
            jumlahSaldoBerkurang: amount,
        });
        await Credit.create({
            credit_id: uuidv4(),
            transaksi_id: transaksi.transaksi_id, // credit kosong untuk transfer keluar
            jumlahSaldoBertambah: 0,
        });
        await Transfer.create({
            transfer_id: uuidv4(),
            transaksi_id: transaksi.transaksi_id,
            noRekening: toRekening,
            berita: note,
        });
        // Proses penerima
        const transaksiMasuk = await Transaksi.create({
            nasabah_id: target.nasabah_id,
            transaksiType: 'MASUK',
            tanggalTransaksi: new Date(),
        });
        await Debit.create({
            debit_id: uuidv4(),
            transaksi_id: transaksiMasuk.transaksi_id,
            jumlahSaldoBerkurang: 0,
        });
        await Credit.create({
            credit_id: uuidv4(),
            transaksi_id: transaksiMasuk.transaksi_id,
            jumlahSaldoBertambah: amount,
        });
        await Transfer.create({
            transfer_id: uuidv4(),
            transaksi_id: transaksiMasuk.transaksi_id,
            noRekening: nasabahId, // atau gunakan source rekening jika ada
            berita: note,
        });
        res.status(200).json({ success: true, data: { transaksi_id: transaksi.transaksi_id } });
    } catch (error) {
        console.error('Error in transferWithPin controller:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses transfer' });
    }
}