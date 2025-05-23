import { Request, Response } from "express";
import * as ReportService from "../service/ReportService";

declare global {
  namespace Express {
    interface User {
      id: number | string;
    }
    interface Request {
      user?: User;
    }
  }
}

export const createReport = async (req: Request, res: Response) => {
  try {
    const { email, deskripsi } = req.body;
    const nasabah_id = req.user?.id;

    if (!nasabah_id || typeof nasabah_id !== "string") {
      res.status(401).json({ message: "Nasabah tidak terautentikasi" });
      return;
    }

    if (!email || !deskripsi) {
      res.status(400).json({ message: "Email dan deskripsi harus diisi" });
      return;
    }

    const report = await ReportService.createReport(nasabah_id, email, deskripsi);
    res.status(201).json(report);
    return;
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat report", error });
    return;
  }
};

export const getMyReports = async (req: Request, res: Response) => {
  try {
    const nasabah_id = req.user?.id;

    if (!nasabah_id || typeof nasabah_id !== "string") {
      res.status(401).json({ message: "Nasabah tidak terautentikasi" });
      return;
    }

    const reports = await ReportService.getReportsByNasabah(nasabah_id);
    res.status(200).json(reports);
    return;
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data report", error });
    return;
  }
};
