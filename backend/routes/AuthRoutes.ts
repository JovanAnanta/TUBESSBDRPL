import express from 'express';
import * as AuthController from '../controller/AuthController';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/loginNasabah', AuthController.login);


export default router;
