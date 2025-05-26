import express from "express";
import { 
  getLoginActivity,
  getNasabahTransactions,
  getNasabahTransactionsByDateRange,
  getLastNasabahTransactions
} from "../controller/CSActivityController";
import authenticateCS from "../middleware/AuthenticateCS";

const router = express.Router();

// Login activity routes
router.get("/activity/:nasabahId/logins", authenticateCS, getLoginActivity);

// Transaction routes - regular and filtered
router.get("/activity/:nasabahId/transactions", authenticateCS, getNasabahTransactions);
router.post("/activity/:nasabahId/transactions/dateRange", authenticateCS, getNasabahTransactionsByDateRange);
router.get("/activity/:nasabahId/transactions/last", authenticateCS, getLastNasabahTransactions);

export default router;
