import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
    getAllNasabah,
    getAllPinjaman,
    getApprovedCount,
    getPendingPinjaman,
    konfirmasiPinjaman,
    loginAdmin,
    ubahStatusNasabah
} from '../controller/AdminController';
import * as AdminService from '../service/AdminService';
import { mockRequest, mockResponse } from './Setup';

// Mock dependencies
jest.mock('../service/AdminService');
jest.mock('jsonwebtoken');

describe('AdminController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('loginAdmin', () => {
        it('should login successfully with correct credentials', async () => {
            // Arrange
            req.body = { email: 'admin@bank.com', password: 'admin123' };
            const mockAdmin = {
                admin_id: '1',
                nama: 'Admin Test',
                email: 'admin@bank.com'
            };

            (AdminService.loginAdminService as jest.Mock).mockResolvedValue(mockAdmin);
            (jwt.sign as jest.Mock).mockReturnValue('admin-token-123');

            // Act
            await loginAdmin(req as Request, res as Response);

            // Assert
            expect(AdminService.loginAdminService).toHaveBeenCalledWith('admin@bank.com', 'admin123');
            expect(jwt.sign).toHaveBeenCalledWith(
                { admin_id: '1', role: 'admin' },
                expect.any(String),
                { expiresIn: '2h' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                token: 'admin-token-123',
                nama: 'Admin Test',
                email: 'admin@bank.com'
            });
        });

        it('should return 400 when login fails', async () => {
            // Arrange
            req.body = { email: 'wrong@bank.com', password: 'wrongpass' };
            const error = new Error('Admin tidak ditemukan');
            (AdminService.loginAdminService as jest.Mock).mockRejectedValue(error);

            // Act
            await loginAdmin(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Admin tidak ditemukan' });
        });
    });

    describe('getPendingPinjaman', () => {
        it('should return pending loan applications', async () => {
            // Arrange
            const mockPinjaman = [
                {
                    pinjaman_id: 'loan-1',
                    jumlahPinjaman: 5000000,
                    statusJatuhTempo: '12BULAN',
                    tanggalJatuhTempo: new Date(),
                    statusPinjaman: 'PENDING',
                    nasabah: {
                        nama: 'John Doe',
                        email: 'john@example.com',
                        nasabah_id: '123'
                    }
                }
            ];

            (AdminService.getPendingPinjamanService as jest.Mock).mockResolvedValue(mockPinjaman);

            // Act
            await getPendingPinjaman(req as Request, res as Response);

            // Assert
            expect(AdminService.getPendingPinjamanService).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: mockPinjaman });
        });
    });

    describe('konfirmasiPinjaman', () => {
        it('should confirm loan with ACCEPTED status', async () => {
            // Arrange
            req.params = { id: 'loan-1' };
            req.body = { status: 'ACCEPTED' };

            const mockResult = {
                pinjaman_id: 'loan-1',
                statusPinjaman: 'ACCEPTED'
            };

            (AdminService.konfirmasiPinjamanService as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await konfirmasiPinjaman(req as Request, res as Response);

            // Assert
            expect(AdminService.konfirmasiPinjamanService).toHaveBeenCalledWith('loan-1', 'ACCEPTED');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Status pinjaman diperbarui',
                data: mockResult
            });
        });

        it('should confirm loan with REJECTED status', async () => {
            // Arrange
            req.params = { id: 'loan-1' };
            req.body = { status: 'REJECTED' };

            const mockResult = {
                pinjaman_id: 'loan-1',
                statusPinjaman: 'REJECTED'
            };

            (AdminService.konfirmasiPinjamanService as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await konfirmasiPinjaman(req as Request, res as Response);

            // Assert
            expect(AdminService.konfirmasiPinjamanService).toHaveBeenCalledWith('loan-1', 'REJECTED');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 for invalid status', async () => {
            // Arrange
            req.params = { id: 'loan-1' };
            req.body = { status: 'INVALID' };

            // Act
            await konfirmasiPinjaman(req as Request, res as Response);

            // Assert
            expect(AdminService.konfirmasiPinjamanService).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Status harus ACCEPTED atau REJECTED'
            });
        });
    });

    describe('getAllNasabah', () => {
        it('should return all customers successfully', async () => {
            // Arrange
            const mockNasabahList = [
                {
                    nasabah_id: '123',
                    nama: 'John Doe',
                    email: 'john@example.com',
                    status: 'AKTIF'
                },
                {
                    nasabah_id: '124',
                    nama: 'Jane Smith',
                    email: 'jane@example.com',
                    status: 'AKTIF'
                }
            ];

            (AdminService.getAllNasabahService as jest.Mock).mockResolvedValue(mockNasabahList);

            // Act
            await getAllNasabah(req as Request, res as Response);

            // Assert
            expect(AdminService.getAllNasabahService).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: mockNasabahList });
        });
    });

    describe('ubahStatusNasabah', () => {
        it('should update customer status successfully', async () => {
            // Arrange
            req.params = { id: '123' };
            req.body = { status: 'TIDAK AKTIF' };

            const mockUpdated = {
                nama: 'John Doe',
                nasabah_id: '123',
                status: 'TIDAK AKTIF'
            };

            (AdminService.ubahStatusNasabahService as jest.Mock).mockResolvedValue(mockUpdated);

            // Act
            await ubahStatusNasabah(req as Request, res as Response);

            // Assert
            expect(AdminService.ubahStatusNasabahService).toHaveBeenCalledWith('123', 'TIDAK AKTIF');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Status nasabah berhasil diubah ke TIDAK AKTIF',
                data: mockUpdated
            });
        });

        it('should return 400 for invalid status value', async () => {
            // Arrange
            req.params = { id: '123' };
            req.body = { status: 'INVALID' };

            // Act
            await ubahStatusNasabah(req as Request, res as Response);

            // Assert
            expect(AdminService.ubahStatusNasabahService).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Status harus AKTIF atau TIDAK AKTIF'
            });
        });
    });

    describe('getApprovedCount', () => {
        it('should return count of approved loans', async () => {
            // Arrange
            (AdminService.getApprovedPinjamanCount as jest.Mock).mockResolvedValue(42);

            // Act
            await getApprovedCount(req as Request, res as Response);

            // Assert
            expect(AdminService.getApprovedPinjamanCount).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ totalApproved: 42 });
        });
    });

    describe('getAllPinjaman', () => {
        it('should return all loans', async () => {
            // Arrange
            const mockLoans = [
                { pinjaman_id: 'loan-1', jumlahPinjaman: 5000000 },
                { pinjaman_id: 'loan-2', jumlahPinjaman: 10000000 }
            ];

            (AdminService.getAllPinjamanService as jest.Mock).mockResolvedValue(mockLoans);

            // Act
            await getAllPinjaman(req as Request, res as Response);

            // Assert
            expect(AdminService.getAllPinjamanService).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: mockLoans });
        });
    });
});