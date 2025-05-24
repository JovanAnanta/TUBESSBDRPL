import { Request, Response } from 'express';
import * as pinService from '../service/PinService';
import { Nasabah } from '../models/Nasabah';

export const setPin = async (req: Request, res: Response): Promise<void> => {
    const { nasabahId, pin } = req.body;
    
    try {
        const result = await pinService.setPinNasabah(nasabahId, pin);
        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        } else {
        res.status(500).json({ error: "Internal server error" });
        }
    }
}

export const verifyPin = async (req: Request, res: Response): Promise<void> => {
    const { nasabahId, pin } = req.body;
    
    try {
        // Validasi input
        if (!nasabahId || !pin) {
            res.status(400).json({
                success: false,
                message: 'nasabahId dan pin harus diisi'
            });
            return;
        }

        // Validasi format PIN (6 digit)
        if (!/^\d{6}$/.test(pin)) {
            res.status(400).json({
                success: false,
                message: 'PIN harus terdiri dari 6 digit angka'
            });
            return;
        }

        const result = await pinService.verifyPin(nasabahId, pin);
        
        // Set status code berdasarkan hasil
        if (result.success) {
            res.status(200).json(result);
        } else if (result.isBlocked) {
            res.status(423).json(result); // 423 Locked
        } else {
            res.status(401).json(result); // 401 Unauthorized
        }
        
    } catch (error) {
        console.error('Error in verifyPin controller:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan sistem. Silakan coba lagi.'
        });
    }
}

export const blockAccount = async (req: Request, res: Response): Promise<void> => {
    const { nasabahId } = req.body;
    
    try {
        if (!nasabahId) {
            res.status(400).json({
                success: false,
                message: 'nasabahId harus diisi'
            });
            return;
        }

        const result = await pinService.blockAccount(nasabahId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }
        
    } catch (error) {
        console.error('Error in blockAccount controller:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan sistem'
        });
    }
}

export const checkPinStatus = async (req: Request, res: Response): Promise<void> => {
    const { nasabahId } = req.params;
    
    try {
        if (!nasabahId) {
            res.status(400).json({
                success: false,
                message: 'nasabahId harus diisi'
            });
            return;
        }

        const remainingAttempts = pinService.getRemainingAttempts(nasabahId);
        const isBlocked = pinService.isAccountBlocked(nasabahId);
        
        res.status(200).json({
            success: true,
            remainingAttempts,
            isBlocked,
            message: isBlocked ? 'Akun sedang diblokir' : `Sisa percobaan: ${remainingAttempts}`
        });
        
    } catch (error) {
        console.error('Error in checkPinStatus controller:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan sistem'
        });
    }
}