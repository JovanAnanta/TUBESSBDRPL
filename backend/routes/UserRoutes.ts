// src/routes/pinRoutes.ts
import { Router } from 'express';
import * as PinController from '../controller/PinController';
import * as MutasiController from '../controller/MutasiController';
import { getNasabahData } from '../controller/AuthController';
import { validateNasabahStatus } from '../middleware/ValidateNasabahStatus';

const router = Router();

// Authentication routes
router.get('/getDataNasabah', validateNasabahStatus, getNasabahData);

// PIN routes
router.post('/setpin', validateNasabahStatus, PinController.setPin);
router.post('/verifyPin', validateNasabahStatus, PinController.verifyPin);
router.post('/blockAccount', validateNasabahStatus, PinController.blockAccount);
router.get('/pinStatus/:nasabahId', validateNasabahStatus, PinController.checkPinStatus);

// Mutasi & Saldo routes
router.get('/saldo/:nasabahId', validateNasabahStatus, MutasiController.getSaldoInfo);
router.get('/mutasi/:nasabahId', validateNasabahStatus, MutasiController.getMutasiRekening);
router.post('/mutasi/:nasabahId/dateRange', validateNasabahStatus, MutasiController.getMutasiByDateRange);
router.get('/mutasi/:nasabahId/last', validateNasabahStatus, MutasiController.getLastTransactions);

export default router;
