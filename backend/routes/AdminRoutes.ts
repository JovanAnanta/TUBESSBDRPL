import express from 'express';
import { loginAdmin } from '../controller/AdminController';
import authenticateAdmin from '../middleware/AuthenticateAdmin';
import { getPendingPinjaman, konfirmasiPinjaman } from '../controller/AdminController';
import { ubahStatusNasabah } from '../controller/AdminController';
import { getAllNasabah } from '../controller/AdminController';

const router = express.Router();

router.post('/login', loginAdmin);

router.get('/pinjaman/daftar', authenticateAdmin, getPendingPinjaman);
router.patch('/pinjaman/:id/konfirmasi', authenticateAdmin, konfirmasiPinjaman);
router.get('/nasabah', authenticateAdmin, getAllNasabah);
router.patch('/nasabah/:id/status', authenticateAdmin, ubahStatusNasabah);

export default router;
