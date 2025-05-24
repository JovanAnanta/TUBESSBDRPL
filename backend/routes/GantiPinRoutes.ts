import { Router } from "express";
import * as gantiPinController from "../controller/GantiPinController";
import authenticateToken from "../middleware/AuthenticateToken";

const router = Router();

router.post("/ganti-pin", authenticateToken, gantiPinController.gantiPin);

export default router;
