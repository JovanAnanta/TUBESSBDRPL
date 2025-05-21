import { Router } from 'express';
import { createReport, getMyReports } from '../controller/ReportController';
import AuthenticateToken from '../middleware/AuthenticateToken';

const router = Router();

router.post('/', AuthenticateToken, createReport);
router.get('/', AuthenticateToken, getMyReports);

export default router;
