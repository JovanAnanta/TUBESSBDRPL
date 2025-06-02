import { Request, Response } from 'express';
import {
    getLastTransactions,
    getMutasiByDateRange,
    getMutasiRekening,
    getSaldoInfo
} from '../controller/MutasiController';
import * as mutasiService from '../service/MutasiService';
import { mockRequest, mockResponse } from './Setup';

// Mock dependencies
jest.mock('../service/MutasiService');

describe('MutasiController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('getSaldoInfo', () => {
        it('should return saldo info successfully', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            const mockSaldoInfo = {
                nasabah_id: '123',
                nama: 'John Doe',
                noRekening: '1234567890',
                saldo: 1000000,
                lastUpdate: new Date()
            };
            (mutasiService.getSaldoInfo as jest.Mock).mockResolvedValue(mockSaldoInfo);

            // Act
            await getSaldoInfo(req as Request, res as Response);

            // Assert
            expect(mutasiService.getSaldoInfo).toHaveBeenCalledWith('123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockSaldoInfo,
                message: 'Informasi saldo berhasil diambil'
            });
        });

        it('should return 400 if nasabahId is missing', async () => {
            // Arrange
            req.params = {};

            // Act
            await getSaldoInfo(req as Request, res as Response);

            // Assert
            expect(mutasiService.getSaldoInfo).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'nasabahId harus diisi'
            });
        });

        it('should return 404 if nasabah not found', async () => {
            // Arrange
            req.params = { nasabahId: '999' };
            (mutasiService.getSaldoInfo as jest.Mock).mockResolvedValue(null);

            // Act
            await getSaldoInfo(req as Request, res as Response);

            // Assert
            expect(mutasiService.getSaldoInfo).toHaveBeenCalledWith('999');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Data nasabah tidak ditemukan'
            });
        });

        it('should return 500 on service error', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            const error = new Error('Database error');
            (mutasiService.getSaldoInfo as jest.Mock).mockRejectedValue(error);

            // Act
            await getSaldoInfo(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Database error'
            });
        });
    });

    describe('getMutasiRekening', () => {
        it('should return mutasi rekening successfully', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.query = { limit: '10', offset: '0' };
            const mockTransactions = {
                transactions: [
                    {
                        transaksi_id: 'txn-1',
                        tanggalTransaksi: new Date(),
                        transaksiType: 'MASUK',
                        nominal: 50000,
                        keterangan: 'Top up',
                        saldoSetelahTransaksi: 1050000
                    }
                ],
                totalCount: 1
            };
            (mutasiService.getMutasiRekening as jest.Mock).mockResolvedValue(mockTransactions);

            // Act
            await getMutasiRekening(req as Request, res as Response);

            // Assert
            expect(mutasiService.getMutasiRekening).toHaveBeenCalledWith('123', 10, 0, undefined, undefined);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockTransactions.transactions,
                pagination: {
                    limit: 10,
                    offset: 0,
                    totalCount: 1,
                    hasMore: false
                },
                message: 'Mutasi rekening berhasil diambil'
            });
        });

        it('should handle date range parameters correctly', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.query = {
                limit: '10',
                offset: '0',
                startDate: '2023-01-01',
                endDate: '2023-01-31'
            };

            const mockTransactions = { transactions: [], totalCount: 0 };
            (mutasiService.getMutasiRekening as jest.Mock).mockResolvedValue(mockTransactions);

            // Act
            await getMutasiRekening(req as Request, res as Response);

            // Assert
            expect(mutasiService.getMutasiRekening).toHaveBeenCalledWith(
                '123',
                10,
                0,
                expect.any(Date),
                expect.any(Date)
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 if nasabahId is missing', async () => {
            // Arrange
            req.params = {};

            // Act
            await getMutasiRekening(req as Request, res as Response);

            // Assert
            expect(mutasiService.getMutasiRekening).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'nasabahId harus diisi'
            });
        });
    });

    describe('getMutasiByDateRange', () => {
        it('should return mutasi by date range successfully', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.body = {
                startDate: '2023-01-01',
                endDate: '2023-01-31'
            };
            const mockTransactions = [
                {
                    transaksi_id: 'txn-1',
                    tanggalTransaksi: new Date('2023-01-15'),
                    transaksiType: 'MASUK',
                    nominal: 50000,
                    keterangan: 'Top up',
                    saldoSetelahTransaksi: 1050000
                }
            ];
            (mutasiService.getMutasiByDateRange as jest.Mock).mockResolvedValue(mockTransactions);

            // Act
            await getMutasiByDateRange(req as Request, res as Response);

            // Assert
            expect(mutasiService.getMutasiByDateRange).toHaveBeenCalledWith(
                '123',
                expect.any(Date),
                expect.any(Date)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockTransactions,
                message: 'Mutasi berdasarkan periode berhasil diambil'
            });
        });

        it('should return 400 if date range is invalid', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.body = {
                startDate: '2023-01-31',
                endDate: '2023-01-01' // End date before start date
            };

            // Act
            await getMutasiByDateRange(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir'
            });
        });
    });

    describe('getLastTransactions', () => {
        it('should return last transactions successfully', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.query = { count: '3' };
            const mockTransactions = [
                {
                    transaksi_id: 'txn-1',
                    tanggalTransaksi: new Date(),
                    transaksiType: 'MASUK',
                    nominal: 50000,
                    keterangan: 'Top up',
                    saldoSetelahTransaksi: 1050000
                }
            ];
            (mutasiService.getLastTransactions as jest.Mock).mockResolvedValue(mockTransactions);

            // Act
            await getLastTransactions(req as Request, res as Response);

            // Assert
            expect(mutasiService.getLastTransactions).toHaveBeenCalledWith('123', 3);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockTransactions,
                message: 'Transaksi terakhir berhasil diambil'
            });
        });
    });
});