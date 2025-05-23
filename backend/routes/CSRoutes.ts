import express from 'express';
import { login } from '../controller/CSController';
import { getStats } from '../controller/CSController';
import authenticateCS from '../middleware/AuthenticateCS';

const router = express.Router();
router.post('/login', login);
router.get('/stats', authenticateCS, getStats);

export default router;

