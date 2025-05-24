import { Router } from "express";
import * as tagihanController from "../controller/TagihanController";
import authenticateToken from "../middleware/AuthenticateToken";

const router = Router();

router.post("/bayar", authenticateToken, tagihanController.bayarTagihan);
router.get("/riwayat", authenticateToken, tagihanController.getRiwayatTagihan);

export default router;
