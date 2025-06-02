import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
    getStats,
    login,
    resetPasswordNasabah,
    verifyNasabahData,
    verifyNasabahForReset
} from '../controller/CSController';
import { decrypt } from '../enkripsi/Encryptor';
import * as CSService from '../service/CSService';
import { mockRequest, mockResponse } from './Setup';

// Mock dependencies
jest.mock('../service/CSService');
jest.mock('../enkripsi/Encryptor');
jest.mock('jsonwebtoken');

describe('CSController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return token and name when login succeeds', async () => {
            // Arrange
            req.body = { email: 'cs@example.com', password: 'password123' };
            const mockCS = { cs_id: '1', nama: 'CS Test' };
            (CSService.loginCS as jest.Mock).mockResolvedValue(mockCS);
            (jwt.sign as jest.Mock).mockReturnValue('test-token-123');

            // Act
            await login(req as Request, res as Response);

            // Assert
            expect(CSService.loginCS).toHaveBeenCalledWith('cs@example.com', 'password123');
            expect(jwt.sign).toHaveBeenCalledWith(
                { cs_id: '1', role: 'cs' },
                expect.any(String),
                { expiresIn: '2h' }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token: 'test-token-123', nama: 'CS Test' });
        });

        it('should return 401 when authentication fails', async () => {
            // Arrange
            req.body = { email: 'cs@example.com', password: 'wrong-password' };
            (CSService.loginCS as jest.Mock).mockResolvedValue(null);

            // Act
            await login(req as Request, res as Response);

            // Assert
            expect(CSService.loginCS).toHaveBeenCalledWith('cs@example.com', 'wrong-password');
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email atau Password salah' });
        });

        it('should return 500 when server error occurs', async () => {
            // Arrange
            req.body = { email: 'cs@example.com', password: 'password123' };
            (CSService.loginCS as jest.Mock).mockRejectedValue(new Error('Database error'));

            // Act
            await login(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Terjadi kesalahan pada server' });
        });
    });

    describe('getStats', () => {
        it('should return dashboard statistics', async () => {
            // Arrange
            const mockStats = {
                pendingReports: 15,
                completedReports: 30,
                pendingValidations: 0,
                totalCustomers: 100
            };
            (CSService.getDashboardStats as jest.Mock).mockResolvedValue(mockStats);

            // Act
            await getStats(req as Request, res as Response);

            // Assert
            expect(CSService.getDashboardStats).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockStats);
        });

        it('should return 500 when fetching stats fails', async () => {
            // Arrange
            (CSService.getDashboardStats as jest.Mock).mockRejectedValue(new Error('Database error'));

            // Act
            await getStats(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Gagal mengambil statistik' });
        });
    });

    describe('verifyNasabahData', () => {
        it('should verify nasabah data successfully', async () => {
            // Arrange
            const mockNasabah = {
                nasabah_id: '123',
                nama: 'encrypted_name',
                email: 'encrypted_email',
                noRekening: 'encrypted_rekening',
                saldo: 1000000
            };

            req.body = {
                nama: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };

            (CSService.verifyNasabahData as jest.Mock).mockResolvedValue(mockNasabah);
            (decrypt as jest.Mock).mockImplementation((text) => {
                if (text === 'encrypted_name') return 'John Doe';
                if (text === 'encrypted_email') return 'john@example.com';
                if (text === 'encrypted_rekening') return '1234567890';
                return text;
            });

            // Act
            await verifyNasabahData(req as Request, res as Response);

            // Assert
            expect(CSService.verifyNasabahData).toHaveBeenCalledWith(
                'John Doe',
                'john@example.com',
                'password123'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Verifikasi berhasil',
                data: {
                    nasabah_id: '123',
                    nama: 'John Doe',
                    email: 'john@example.com',
                    noRekening: '1234567890',
                    saldo: 1000000,
                }
            });
        });

        it('should return 404 when nasabah is not found or password is wrong', async () => {
            // Arrange
            req.body = {
                nama: 'Invalid Name',
                email: 'invalid@example.com',
                password: 'wrong-password'
            };
            (CSService.verifyNasabahData as jest.Mock).mockResolvedValue(null);

            // Act
            await verifyNasabahData(req as Request, res as Response);

            // Assert
            expect(CSService.verifyNasabahData).toHaveBeenCalledWith(
                'Invalid Name',
                'invalid@example.com',
                'wrong-password'
            );
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Data nasabah tidak ditemukan atau password salah"
            });
        });

        it('should return 500 when server error occurs', async () => {
            // Arrange
            req.body = {
                nama: 'John Doe',
                email: 'john@example.com',
                password: 'password123'
            };
            (CSService.verifyNasabahData as jest.Mock).mockRejectedValue(new Error('Database error'));

            // Act
            await verifyNasabahData(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Terjadi kesalahan pada server" });
        });
    });

    describe('verifyNasabahForReset', () => {
        it('should verify nasabah for password reset successfully', async () => {
            // Arrange
            const mockNasabah = {
                nasabah_id: '123',
                nama: 'encrypted_name',
                email: 'encrypted_email',
                noRekening: 'encrypted_rekening',
                saldo: 1000000,
                status: 'ACTIVE'
            };

            req.body = {
                nama: 'John Doe',
                email: 'john@example.com',
                noRekening: '1234567890'
            };

            (CSService.verifyNasabahForReset as jest.Mock).mockResolvedValue(mockNasabah);
            (decrypt as jest.Mock).mockImplementation((text) => {
                if (text === 'encrypted_name') return 'John Doe';
                if (text === 'encrypted_email') return 'john@example.com';
                if (text === 'encrypted_rekening') return '1234567890';
                return text;
            });

            // Act
            await verifyNasabahForReset(req as Request, res as Response);

            // Assert
            expect(CSService.verifyNasabahForReset).toHaveBeenCalledWith(
                'John Doe',
                'john@example.com',
                '1234567890'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Verifikasi berhasil',
                data: {
                    nasabah_id: '123',
                    nama: 'John Doe',
                    email: 'john@example.com',
                    noRekening: '1234567890',
                    saldo: 1000000,
                    status: 'ACTIVE'
                }
            });
        });

        it('should return 400 when required fields are missing', async () => {
            // Arrange - missing noRekening
            req.body = { nama: 'John Doe', email: 'john@example.com' };

            // Act
            await verifyNasabahForReset(req as Request, res as Response);

            // Assert
            expect(CSService.verifyNasabahForReset).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Semua field harus diisi' });
        });

        it('should return 404 when nasabah is not found', async () => {
            // Arrange
            req.body = {
                nama: 'Invalid Name',
                email: 'invalid@example.com',
                noRekening: '9999999999'
            };
            (CSService.verifyNasabahForReset as jest.Mock).mockResolvedValue(null);

            // Act
            await verifyNasabahForReset(req as Request, res as Response);

            // Assert
            expect(CSService.verifyNasabahForReset).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Data nasabah tidak ditemukan atau tidak sesuai"
            });
        });
    });

    describe('resetPasswordNasabah', () => {
        it('should reset password successfully', async () => {
            // Arrange
            req.body = {
                email: 'john@example.com',
                nama: 'John Doe',
                noRekening: '1234567890',
                passwordBaru: 'newPassword123'
            };

            const mockUpdatedNasabah = {
                nama: 'encrypted_name',
                email: 'encrypted_email'
            };

            (CSService.resetNasabahPassword as jest.Mock).mockResolvedValue(mockUpdatedNasabah);
            (decrypt as jest.Mock).mockImplementation((text) => {
                if (text === 'encrypted_name') return 'John Doe';
                if (text === 'encrypted_email') return 'john@example.com';
                return text;
            });

            // Act
            await resetPasswordNasabah(req as Request, res as Response);

            // Assert
            expect(CSService.resetNasabahPassword).toHaveBeenCalledWith(
                'john@example.com',
                'John Doe',
                '1234567890',
                'newPassword123'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Password berhasil direset',
                data: {
                    nama: 'John Doe',
                    email: 'john@example.com'
                }
            });
        });

        it('should return 400 when required fields are missing', async () => {
            // Arrange - missing passwordBaru
            req.body = {
                email: 'john@example.com',
                nama: 'John Doe',
                noRekening: '1234567890'
            };

            // Act
            await resetPasswordNasabah(req as Request, res as Response);

            // Assert
            expect(CSService.resetNasabahPassword).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Semua field wajib diisi' });
        });

        it('should return 404 when nasabah is not found', async () => {
            // Arrange
            req.body = {
                email: 'invalid@example.com',
                nama: 'Invalid Name',
                noRekening: '9999999999',
                passwordBaru: 'newPassword123'
            };

            (CSService.resetNasabahPassword as jest.Mock).mockResolvedValue(null);

            // Act
            await resetPasswordNasabah(req as Request, res as Response);

            // Assert
            expect(CSService.resetNasabahPassword).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Data nasabah tidak ditemukan atau tidak sesuai'
            });
        });

        it('should return 500 when server error occurs', async () => {
            // Arrange
            req.body = {
                email: 'john@example.com',
                nama: 'John Doe',
                noRekening: '1234567890',
                passwordBaru: 'newPassword123'
            };

            const error = new Error('Database connection failed');
            (CSService.resetNasabahPassword as jest.Mock).mockRejectedValue(error);

            // Act
            await resetPasswordNasabah(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Database connection failed'
            });
        });
    });
});