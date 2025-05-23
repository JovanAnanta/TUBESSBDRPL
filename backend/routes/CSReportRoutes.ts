import express from 'express';
import { lihatSemuaReport, ubahStatusReport } from '../controller/CSReportController';
import authenticateCS from '../middleware/AuthenticateCS';

const router = express.Router();

router.get('/reports', authenticateCS, lihatSemuaReport);
router.patch('/report/:id/status', authenticateCS, ubahStatusReport);

export default router;
