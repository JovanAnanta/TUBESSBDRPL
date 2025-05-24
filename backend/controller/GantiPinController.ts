import { Request, Response } from "express";
import * as gantiPinService from "../service/GantiPinService";

export const gantiPin = async (req: Request, res: Response) => {
    try {
        const nasabah_id = String(req.user?.id);
        const { oldPin, newPin } = req.body;

        if (!oldPin || !newPin) {
            res.status(400).json({ error: "PIN lama dan baru harus diisi." });
            return;
        }

        const result = await gantiPinService.gantiPin(nasabah_id, oldPin, newPin);
        res.status(200).json(result);
        return;
    } catch (error: any) {
        res.status(400).json({ error: error.message });
        return;
    }
};
