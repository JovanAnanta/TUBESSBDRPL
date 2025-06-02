    import express from 'express';
    import { loginAdmin } from '../controller/AdminController';
    import authenticateAdmin from '../middleware/AuthenticateAdmin';
    import { getPendingPinjaman, konfirmasiPinjaman } from '../controller/AdminController';
    import { ubahStatusNasabah } from '../controller/AdminController';
    import { getAllNasabah, getApprovedCount, getAllPinjaman} from '../controller/AdminController';

    const router = express.Router();

    router.post('/login', loginAdmin);

    router.get('/pinjaman/daftar', authenticateAdmin, getAllPinjaman);
    router.patch('/pinjaman/:id/konfirmasi', authenticateAdmin, konfirmasiPinjaman);
    router.get('/nasabah', authenticateAdmin, getAllNasabah);
    router.patch('/nasabah/:id/status', authenticateAdmin, ubahStatusNasabah);
    router.get("/approved-count", getApprovedCount);


    export default router;
