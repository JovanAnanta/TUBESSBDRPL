import express from "express";
import { getLoginActivity } from "../controller/CSActivityController";
import authenticateCS from "../middleware/AuthenticateCS";
import { getNasabahTransactions } from "../controller/CSActivityController";

const router = express.Router();

router.get("/activity/:nasabahId/logins", authenticateCS, getLoginActivity);
router.get("/activity/:nasabahId/transactions", authenticateCS, getNasabahTransactions);

export default router;
