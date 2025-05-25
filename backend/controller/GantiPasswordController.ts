import { Request, Response } from 'express';
import { gantiPassword } from '../service/GantiPasswordService';

export const gantiPasswordController = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const nasabah_id = user?.id;
        const { oldPassword, newPassword } = req.body;

        if (!nasabah_id || !oldPassword || !newPassword) {
            res.status(400).json({ message: 'Data tidak lengkap' });
            return;
        }

        const result = await gantiPassword(nasabah_id, oldPassword, newPassword);
        res.status(200).json({ message: 'Password berhasil diganti', data: result });
    } catch (error: any) {
        console.error('Ganti Password Error:', error);
        res.status(400).json({ message: error.message || 'Gagal mengganti password' });
    }
};
