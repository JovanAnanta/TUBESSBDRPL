import { Request, Response } from 'express';
import * as mutasiService from '../service/MutasiService';

export const getSaldoInfo = async (req: Request, res: Response): Promise<void> => {
    const { nasabahId } = req.params;
    
    try {
        if (!nasabahId) {
            res.status(400).json({
                success: false,
                message: 'nasabahId harus diisi'
            });
            return;
        }
        
        const saldoInfo = await mutasiService.getSaldoInfo(nasabahId);
        
        if (!saldoInfo) {
            res.status(404).json({
                success: false,
                message: 'Data nasabah tidak ditemukan'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: saldoInfo,
            message: 'Informasi saldo berhasil diambil'
        });
        
    } catch (error) {
        console.error('Error in getSaldoInfo controller:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Terjadi kesalahan sistem'
        });
    }
};

export const getMutasiRekening = async (req: Request, res: Response): Promise<void> => {
    const { nasabahId } = req.params;
    const { 
        limit = 20, 
        offset = 0, 
        startDate, 
        endDate 
    } = req.query;
    
    try {
        if (!nasabahId) {
            res.status(400).json({
                success: false,
                message: 'nasabahId harus diisi'
            });
            return;
        }

        // Parse dates jika ada
        let parsedStartDate: Date | undefined;
        let parsedEndDate: Date | undefined;
        
        if (startDate) {
            parsedStartDate = new Date(startDate as string);
            if (isNaN(parsedStartDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: 'Format startDate tidak valid'
                });
                return;
            }
        }
        
        if (endDate) {
            parsedEndDate = new Date(endDate as string);
            if (isNaN(parsedEndDate.getTime())) {
                res.status(400).json({
                    success: false,
                    message: 'Format endDate tidak valid'
                });
                return;
            }
        }

        const result = await mutasiService.getMutasiRekening(
            nasabahId,
            parseInt(limit as string) || 20,
            parseInt(offset as string) || 0,
            parsedStartDate,
            parsedEndDate
        );

        res.status(200).json({
            success: true,
            data: result.transactions,
            pagination: {
                limit: parseInt(limit as string) || 20,
                offset: parseInt(offset as string) || 0,
                totalCount: result.totalCount,
                hasMore: result.totalCount > (parseInt(offset as string) || 0) + result.transactions.length
            },
            message: 'Mutasi rekening berhasil diambil'
        });
        
    } catch (error) {
        console.error('Error in getMutasiRekening controller:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Terjadi kesalahan sistem'
        });
    }
};

export const getMutasiByDateRange = async (req: Request, res: Response): Promise<void> => {
    const { nasabahId } = req.params;
    const { startDate, endDate } = req.body;
    
    try {
        if (!nasabahId || !startDate || !endDate) {
            res.status(400).json({
                success: false,
                message: 'nasabahId, startDate, dan endDate harus diisi'
            });
            return;
        }

        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
        
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            res.status(400).json({
                success: false,
                message: 'Format tanggal tidak valid'
            });
            return;
        }

        if (parsedStartDate > parsedEndDate) {
            res.status(400).json({
                success: false,
                message: 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir'
            });
            return;
        }

        const transactions = await mutasiService.getMutasiByDateRange(
            nasabahId,
            parsedStartDate,
            parsedEndDate
        );

        res.status(200).json({
            success: true,
            data: transactions,
            message: 'Mutasi berdasarkan periode berhasil diambil'
        });
        
    } catch (error) {
        console.error('Error in getMutasiByDateRange controller:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Terjadi kesalahan sistem'
        });
    }
};

export const getLastTransactions = async (req: Request, res: Response): Promise<void> => {
    const { nasabahId } = req.params;
    const { count = 5 } = req.query;
    
    try {
        if (!nasabahId) {
            res.status(400).json({
                success: false,
                message: 'nasabahId harus diisi'
            });
            return;
        }

        const transactions = await mutasiService.getLastTransactions(
            nasabahId,
            parseInt(count as string) || 5
        );

        res.status(200).json({
            success: true,
            data: transactions,
            message: 'Transaksi terakhir berhasil diambil'
        });
        
    } catch (error) {
        console.error('Error in getLastTransactions controller:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Terjadi kesalahan sistem'
        });
    }
};
