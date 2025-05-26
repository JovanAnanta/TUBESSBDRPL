import { Request, Response } from "express";
import { 
  getLoginActivityByNasabah, 
  getAllTransaksiByNasabah, 
  formatTransaksiData,
  getTransaksiByDateRange,
  getLastTransactions 
} from "../service/CSActivityService";

export const getLoginActivity = async (req: Request, res: Response) => {
  const { nasabahId } = req.params;
  const { startDate, endDate } = req.query;
  
  try {
    // Parse dates if provided
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;
    
    if (startDate) {
      parsedStartDate = new Date(startDate as string);
      if (isNaN(parsedStartDate.getTime())) {
        res.status(400).json({ 
          message: "Format tanggal awal tidak valid" 
        });
        return;
      }
    }
    
    if (endDate) {
      parsedEndDate = new Date(endDate as string);
      if (isNaN(parsedEndDate.getTime())) {
         res.status(400).json({ 
          message: "Format tanggal akhir tidak valid" 
        });
        return;
      }
    }
    
    const logins = await getLoginActivityByNasabah(nasabahId, parsedStartDate, parsedEndDate);
    res.status(200).json({ 
      message: "Aktivitas login ditemukan", 
      data: logins 
    });
  } catch (error) {
    console.error("Gagal mengambil aktivitas login:", error);
    res.status(500).json({ 
      message: "Gagal mengambil data aktivitas login" 
    });
  }
};

export const getNasabahTransactions = async (req: Request, res: Response) => {
  const { nasabahId } = req.params;
  const { 
    startDate, 
    endDate, 
    limit = "20", 
    offset = "0"
  } = req.query;
  
  try {
    // Parse dates if provided
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;
    
    if (startDate) {
      parsedStartDate = new Date(startDate as string);
      if (isNaN(parsedStartDate.getTime())) {
         res.status(400).json({ 
          message: "Format tanggal awal tidak valid" 
        });
        return;
      }
    }
    
    if (endDate) {
      parsedEndDate = new Date(endDate as string);
      if (isNaN(parsedEndDate.getTime())) {
         res.status(400).json({ 
          message: "Format tanggal akhir tidak valid" 
        });
        return;
      }
    }

    const result = await getAllTransaksiByNasabah(
      nasabahId,
      parsedStartDate,
      parsedEndDate,
      parseInt(limit as string),
      parseInt(offset as string)
    );
    
    const formatted = formatTransaksiData(result.transactions);

    res.status(200).json({ 
      message: "Riwayat transaksi ditemukan", 
      data: formatted,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        totalCount: result.totalCount,
        hasMore: result.totalCount > parseInt(offset as string) + formatted.length
      }
    });
  } catch (error) {
    console.error("Gagal mengambil riwayat transaksi:", error);
    res.status(500).json({ 
      message: "Gagal mengambil data transaksi" 
    });
  }
};

export const getNasabahTransactionsByDateRange = async (req: Request, res: Response) => {
  const { nasabahId } = req.params;
  const { startDate, endDate } = req.body;
  
  try {
    if (!startDate || !endDate) {
       res.status(400).json({
        message: "Tanggal awal dan akhir harus diisi"
      });
      return;
    }

    // Add console logs for debugging
    console.log('Date range request received:', { nasabahId, startDate, endDate });
    
    // Parse dates from strings (YYYY-MM-DD) to Date objects
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    
    // Log parsed dates
    console.log('Parsed dates:', { 
      parsedStartDate: parsedStartDate.toISOString(),
      parsedEndDate: parsedEndDate.toISOString() 
    });
    
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
       res.status(400).json({
        message: "Format tanggal tidak valid"
      });
      return;
    }

    if (parsedStartDate > parsedEndDate) {
       res.status(400).json({
        message: "Tanggal awal tidak boleh lebih besar dari tanggal akhir"
      });
      return;
    }

    // Make sure parsedEndDate includes the entire day
    parsedEndDate.setHours(23, 59, 59, 999);

    const transactions = await getTransaksiByDateRange(
      nasabahId,
      parsedStartDate,
      parsedEndDate
    );

    console.log(`Found ${transactions.length} transactions in date range`);

    res.status(200).json({
      message: "Riwayat transaksi ditemukan",
      data: transactions
    });
    
  } catch (error: any) {
    console.error("Gagal mengambil riwayat transaksi:", error);
    res.status(500).json({ 
      message: "Gagal mengambil data transaksi: " + (error.message || 'Unknown error')
    });
  }
};

export const getLastNasabahTransactions = async (req: Request, res: Response) => {
  const { nasabahId } = req.params;
  const { count = "5" } = req.query;
  
  try {
    const transactions = await getLastTransactions(
      nasabahId,
      parseInt(count as string)
    );

    res.status(200).json({
      message: "Transaksi terakhir berhasil diambil",
      data: transactions
    });
    
  } catch (error) {
    console.error("Gagal mengambil transaksi terakhir:", error);
    res.status(500).json({
      message: "Gagal mengambil data transaksi terakhir"
    });
  }
};
