import { Request, Response } from "express";
import { PinjamanService } from "../service/PinjamanService";
//cvssf
export class PinjamanController {
  static async getAll(req: Request, res: Response) {
    try {
      const result = await PinjamanService.getAll();
      res.json(result);
    } catch (error) {
      console.error("Error fetching pinjaman:", error);
      res.status(500).json({ error: "Internal server error", details: error });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const result = await PinjamanService.getById(req.params.id);
      if (!result) {
        res.status(404).json({ error: "Pinjaman not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Internal server error", details: error });
    }
  }
  static async create(req: Request, res: Response) {
    try {
      const { statusJatuhTempo, jumlahPerBulan } = req.body;

      if (
        !statusJatuhTempo ||
        jumlahPerBulan === undefined ||
        jumlahPerBulan === null
      ) {
        res.status(400).json({
          error: "Field statusJatuhTempo dan jumlahPerBulan wajib diisi",
        });
        return;
      }

      if (typeof jumlahPerBulan !== "number" || jumlahPerBulan < 0) {
        res
          .status(400)
          .json({ error: "jumlahPerBulan harus berupa angka >= 0" });
        return;
      }

      const pinjaman = await PinjamanService.create({
        statusJatuhTempo,
        jumlahPerBulan,
      });

      res.status(201).json(pinjaman);
      return;
    } catch (error) {
      console.error("Error create pinjaman:", error);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const result = await PinjamanService.update(req.params.id, req.body);
      if (!result) {
        res.status(404).json({ error: "Pinjaman not found" });
        return;
      }
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Failed to update", details: error });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const success = await PinjamanService.delete(req.params.id);
      if (!success) {
        res.status(404).json({ error: "Pinjaman not found" });
        return;
      }
      res.json({ message: "Deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete", details: error });
    }
  }
}
export default PinjamanController;
