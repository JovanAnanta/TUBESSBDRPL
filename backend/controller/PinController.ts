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