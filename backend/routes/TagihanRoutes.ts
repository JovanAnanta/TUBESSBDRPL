import express from 'express';
import { bayarTagihan } from '../controller/TagihanController';
import authenticateToken from '../middleware/AuthenticateToken';

const router = express.Router();

router.post('/tagihan/:type', authenticateToken, bayarTagihan);

export default router;
