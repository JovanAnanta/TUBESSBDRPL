import express from 'express';
import { ajukanPinjaman } from '../controller/PinjamanController';
import authenticateToken from '../middleware/AuthenticateToken';
import { getTagihanPinjaman } from '../controller/PinjamanController';
import { bayarTagihan } from "../controller/PinjamanController";
import { claimPinjaman } from '../controller/PinjamanController';
import { getPinjamanStatus } from "../controller/PinjamanController";

const router = express.Router();

router.post('/ajukan', authenticateToken, ajukanPinjaman);
router.get('/tagihan', authenticateToken, getTagihanPinjaman);
router.post("/tagihan/:tagihan_id/bayar", authenticateToken, bayarTagihan); // ✅ Ubah dari :id ke :tagihan_id
router.post('/claim/:pinjaman_id', authenticateToken, claimPinjaman);
router.get("/status", authenticateToken, getPinjamanStatus);

export default router;
