import { Request, Response } from 'express';
import * as CSReportService from '../service/CSReportService';

export const lihatSemuaReport = async (req: Request, res: Response) => {
  try {
    const reports = await CSReportService.getAllReports();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil laporan', error });
  }
};

export const ubahStatusReport = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['DITERIMA', 'DIABAIKAN'].includes(status)) {
    res.status(400).json({ message: 'Status tidak valid' });
    return;
  }

  try {
    const updated = await CSReportService.updateReportStatus(id, status);
    res.status(200).json(updated);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
