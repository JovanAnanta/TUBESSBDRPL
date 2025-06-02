import { Request, Response } from 'express';
import {
    getLastNasabahTransactions,
    getLoginActivity,
    getNasabahTransactions,
    getNasabahTransactionsByDateRange
} from '../controller/CSActivityController';
import * as CSActivityService from '../service/CSActivityService';
import { mockRequest, mockResponse } from './Setup';

interface LoginActivity {
    login_activity_id: string;
    nasabah_id: string;
    waktu_login: Date;
    ip_address: string;
    user_agent: string;
}

// Mock dependencies
jest.mock('../service/CSActivityService');

describe('CSActivityController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('getLoginActivity', () => {
        it('should return login activities successfully', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            // Add explicit type to mockActivities
            const mockActivities: LoginActivity[] = [
                {
                    login_activity_id: '1',
                    nasabah_id: '123',
                    waktu_login: new Date(),
                    ip_address: '192.168.1.1',
                    user_agent: 'Mozilla/5.0'
                }
            ];
            (CSActivityService.getLoginActivityByNasabah as jest.Mock).mockResolvedValue(mockActivities);

            // Act
            await getLoginActivity(req as Request, res as Response);

            // Assert
            expect(CSActivityService.getLoginActivityByNasabah).toHaveBeenCalledWith('123', undefined, undefined);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Aktivitas login ditemukan",
                data: mockActivities
            });
        });

        it('should filter by date range if provided', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.query = {
                startDate: '2023-01-01',
                endDate: '2023-01-31'
            };
            // Add explicit type here too
            const mockActivities: LoginActivity[] = [];
            (CSActivityService.getLoginActivityByNasabah as jest.Mock).mockResolvedValue(mockActivities);

            // Act
            await getLoginActivity(req as Request, res as Response);

            // Assert
            expect(CSActivityService.getLoginActivityByNasabah).toHaveBeenCalledWith(
                '123',
                expect.any(Date),
                expect.any(Date)
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 when date format is invalid', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.query = { startDate: 'invalid-date' };

            // Act
            await getLoginActivity(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Format tanggal awal tidak valid"
            });
        });
    });

    describe('getNasabahTransactions', () => {
        it('should return transactions successfully', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.query = { limit: '10', offset: '0' };

            const mockResult = {
                transactions: [
                    { transaksi_id: 'txn-1', tanggalTransaksi: new Date() }
                ],
                totalCount: 1
            };

            const mockFormatted = [
                {
                    transaksi_id: 'txn-1',
                    tanggal: '2023-01-01',
                    waktu: '12:00:00',
                    tipe: 'MASUK',
                    jumlah: 50000,
                    keterangan: 'Top up'
                }
            ];

            (CSActivityService.getAllTransaksiByNasabah as jest.Mock).mockResolvedValue(mockResult);
            (CSActivityService.formatTransaksiData as jest.Mock).mockReturnValue(mockFormatted);

            // Act
            await getNasabahTransactions(req as Request, res as Response);

            // Assert
            expect(CSActivityService.getAllTransaksiByNasabah).toHaveBeenCalledWith(
                '123', undefined, undefined, 10, 0
            );
            expect(CSActivityService.formatTransaksiData).toHaveBeenCalledWith(mockResult.transactions);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Riwayat transaksi ditemukan",
                data: mockFormatted,
                pagination: {
                    limit: 10,
                    offset: 0,
                    totalCount: 1,
                    hasMore: false
                }
            });
        });
    });

    describe('getNasabahTransactionsByDateRange', () => {
        it('should return transactions by date range successfully', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.body = {
                startDate: '2023-01-01',
                endDate: '2023-01-31'
            };

            const mockTransactions = [
                {
                    transaksi_id: 'txn-1',
                    tanggal: '2023-01-15',
                    waktu: '12:00:00',
                    tipe: 'MASUK',
                    jumlah: 50000,
                    keterangan: 'Top up'
                }
            ];

            (CSActivityService.getTransaksiByDateRange as jest.Mock).mockResolvedValue(mockTransactions);

            // Act
            await getNasabahTransactionsByDateRange(req as Request, res as Response);

            // Assert
            expect(CSActivityService.getTransaksiByDateRange).toHaveBeenCalledWith(
                '123',
                expect.any(Date),
                expect.any(Date)
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Riwayat transaksi ditemukan",
                data: mockTransactions
            });
        });

        it('should return 400 if date parameters are missing', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.body = { startDate: '2023-01-01' }; // Missing endDate

            // Act
            await getNasabahTransactionsByDateRange(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Tanggal awal dan akhir harus diisi"
            });
        });
    });

    describe('getLastNasabahTransactions', () => {
        it('should return last transactions successfully', async () => {
            // Arrange
            req.params = { nasabahId: '123' };
            req.query = { count: '3' };

            const mockTransactions = [
                {
                    transaksi_id: 'txn-1',
                    tanggal: '2023-01-01',
                    waktu: '12:00:00',
                    tipe: 'MASUK',
                    jumlah: 50000,
                    keterangan: 'Top up'
                }
            ];

            (CSActivityService.getLastTransactions as jest.Mock).mockResolvedValue(mockTransactions);

            // Act
            await getLastNasabahTransactions(req as Request, res as Response);

            // Assert
            expect(CSActivityService.getLastTransactions).toHaveBeenCalledWith('123', 3);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Transaksi terakhir berhasil diambil",
                data: mockTransactions
            });
        });
    });
});