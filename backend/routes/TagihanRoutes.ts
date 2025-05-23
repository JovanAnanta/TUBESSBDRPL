import express from 'express';
import * as TagihanController from '../controller/TagihanController';
import AuthenticateToken from '../middleware/AuthenticateToken';

const router = express.Router();

router.post('/:type', AuthenticateToken, TagihanController.bayarTagihan);
router.get('/riwayat', AuthenticateToken, TagihanController.getRiwayatTagihan);


export default router;