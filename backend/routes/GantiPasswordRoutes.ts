import express from 'express';
import { gantiPasswordController } from '../controller/GantiPasswordController';
import authenticateToken from "../middleware/AuthenticateToken";

const router = express.Router();

router.post('/ganti-password', authenticateToken, gantiPasswordController);

export default router;
