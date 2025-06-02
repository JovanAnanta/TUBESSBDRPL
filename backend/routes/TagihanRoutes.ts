import express from 'express';
import authenticateToken from '../middleware/AuthenticateToken';
import { TagihanController } from '../controller/TagihanController';

const router = express.Router();

// Route untuk pembayaran tagihan air
router.post('/tagihan/air', authenticateToken, TagihanController.bayarTagihanAir);

// Route untuk pembayaran tagihan listrik  
router.post('/tagihan/listrik', authenticateToken, TagihanController.bayarTagihanListrik);

// Route untuk mendapatkan dummy amount tagihan (untuk testing)
router.get('/tagihan/:type/amount/:nomorTagihan', authenticateToken, TagihanController.getBillAmount);

// Route untuk cek kelayakan pembayaran tagihan  
router.get('/tagihan/cek-kelayakan/:type/:nomorTagihan', authenticateToken, TagihanController.cekKelayakanBayar);

export default router;
