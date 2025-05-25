import express from 'express';
import { login } from '../controller/CSController';
import { getStats } from '../controller/CSController';
import authenticateCS from '../middleware/AuthenticateCS';
import { verifyNasabahData } from '../controller/CSController';
import { resetPasswordNasabah } from '../controller/CSController';

const router = express.Router();
router.post('/login', login);
router.get('/stats', authenticateCS, getStats);
router.post('/verify-user', authenticateCS, verifyNasabahData);
router.post('/reset-password', authenticateCS, resetPasswordNasabah);

export default router;

