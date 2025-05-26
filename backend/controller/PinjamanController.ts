import { Request, Response } from "express";
import { PinjamanService } from "../service/PinjamanService";

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

  static async create(req: Request, res: Response) {  // <-- no 'export' here
    try {
      const pinjamanData = req.body.pinjaman;
      const transaksiData = req.body.transaksi;

      if (!pinjamanData || !transaksiData) {
        res.status(400).json({ message: "Pinjaman and Transaksi data required" });
        return;
      }

      const result = await PinjamanService.create(pinjamanData, transaksiData);

      res.status(201).json({
        message: "Pinjaman and Transaksi created successfully",
        transaksi: result.transaksi,
        pinjaman: result.pinjaman,
      });
      return;
    } catch (error: any) {
      console.error("Pinjaman creation error:", error);
      res.status(500).json({ message: "Error creating pinjaman", error: error.message });
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
