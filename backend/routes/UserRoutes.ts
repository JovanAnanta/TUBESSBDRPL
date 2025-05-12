// src/routes/pinRoutes.ts
import { Router } from 'express';
import * as PinController from '../controller/PinController';
import { getNasabahData } from '../controller/AuthController';

const router = Router();

router.get('/getDataNasabah', getNasabahData);
router.post('/setpin' , PinController.setPin);

export default router;
