import { Router } from "express";
import { PinjamanController } from "../controller/PinjamanController";

const router = Router();
//routes
router.get("/", PinjamanController.getAll);
router.get("/:id", PinjamanController.getById);
router.post("/", PinjamanController.create);
router.put("/:id", PinjamanController.update);
router.delete("/:id", PinjamanController.delete);

export default router;
