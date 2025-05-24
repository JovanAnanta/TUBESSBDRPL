// src/routes/pinRoutes.ts
import { Router } from 'express';
import * as PinController from '../controller/PinController';
import * as MutasiController from '../controller/MutasiController';
import * as TransferController from '../controller/TransferController';
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

// Transfer & Top Up routes (with server-side PIN validation)
router.post('/top-up', validateNasabahStatus, TransferController.topUpWithPin);
router.post('/transfer', validateNasabahStatus, TransferController.transferWithPin);
router.get('/e-receipt/:transaksiId', validateNasabahStatus, TransferController.getEReceipt);

// Mutasi & Saldo routes
router.get('/saldo/:nasabahId', validateNasabahStatus, MutasiController.getSaldoInfo);
router.get('/mutasi/:nasabahId', validateNasabahStatus, MutasiController.getMutasiRekening);
router.post('/mutasi/:nasabahId/dateRange', validateNasabahStatus, MutasiController.getMutasiByDateRange);
router.get('/mutasi/:nasabahId/last', validateNasabahStatus, MutasiController.getLastTransactions);

export default router;
