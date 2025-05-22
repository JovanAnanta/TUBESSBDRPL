import { Report } from '../models/Report';

export const getAllReports = async () => {
  return await Report.findAll();
};

export const updateReportStatus = async (reportId: string, status: 'DITERIMA' | 'DIABAIKAN') => {
  const report = await Report.findByPk(reportId);

  if (!report) {
    throw new Error('Report tidak ditemukan');
  }

  report.status = status;
  await report.save();

  return report;
};
