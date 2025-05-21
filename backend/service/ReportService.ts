import { Report } from "../models/Report";

export const createReport = async (
  nasabah_id: string,
  email: string,
  deskripsi: string
) => {
  return await Report.create({
    nasabah_id,
    email,
    deskripsi,
    status: "DIPROSES"
  });
};

export const getReportsByNasabah = async (nasabah_id: string) => {
  return await Report.findAll({ where: { nasabah_id } });
};
