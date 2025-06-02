import { Request, Response } from 'express';
import {
    ajukanPinjaman,
    bayarTagihan,
    claimPinjaman,
    getPinjamanStatus,
    getTagihanPinjaman
} from '../controller/PinjamanController';
import * as pinjamanService from '../service/PinjamanService';
import { mockRequest, mockResponse } from './Setup';

// Mock the service
jest.mock('../service/PinjamanService');

describe('PinjamanController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
        
        // Default user setup for authenticated routes
        req.user = { id: 'user-123' };
    });

    describe('ajukanPinjaman', () => {
        it('should submit loan application successfully', async () => {
            // Arrange
            req.body = { 
                jumlahPinjaman: 5000000, 
                statusJatuhTempo: '12BULAN' 
            };
            
            const mockResult = {
                pinjaman_id: 'loan-123',
                nasabah_id: 'user-123',
                jumlahPinjaman: 5000000,
                statusJatuhTempo: '12BULAN',
                statusPinjaman: 'PENDING'
            };
            
            (pinjamanService.ajukanPinjamanService as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await ajukanPinjaman(req as Request, res as Response);

            // Assert
            expect(pinjamanService.ajukanPinjamanService).toHaveBeenCalledWith(
                'user-123', 5000000, '12BULAN'
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Pengajuan pinjaman berhasil, menunggu konfirmasi admin.',
                data: mockResult
            });
        });

        it('should return 400 if jumlahPinjaman is missing', async () => {
            // Arrange
            req.body = { statusJatuhTempo: '12BULAN' };

            // Act
            await ajukanPinjaman(req as Request, res as Response);

            // Assert
            expect(pinjamanService.ajukanPinjamanService).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Lengkapi data pinjaman' });
        });

        it('should return 400 if statusJatuhTempo is missing', async () => {
            // Arrange
            req.body = { jumlahPinjaman: 5000000 };

            // Act
            await ajukanPinjaman(req as Request, res as Response);

            // Assert
            expect(pinjamanService.ajukanPinjamanService).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Lengkapi data pinjaman' });
        });

        it('should return 500 when service throws an error', async () => {
            // Arrange
            req.body = { 
                jumlahPinjaman: 5000000, 
                statusJatuhTempo: '12BULAN' 
            };
            
            const error = new Error('Database error');
            (pinjamanService.ajukanPinjamanService as jest.Mock).mockRejectedValue(error);

            // Act
            await ajukanPinjaman(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
        });
    });

    describe('getTagihanPinjaman', () => {
        it('should fetch loan bills successfully', async () => {
            // Arrange
            const mockTagihan = [
                {
                    tagihan_id: 'bill-1',
                    pinjaman_id: 'loan-1',
                    jumlahTagihan: 500000,
                    tanggalJatuhTempo: '2023-12-01',
                    statusTagihan: 'BELUM DIBAYAR'
                }
            ];
            
            (pinjamanService.getTagihanPinjamanByUser as jest.Mock).mockResolvedValue(mockTagihan);

            // Act
            await getTagihanPinjaman(req as Request, res as Response);

            // Assert
            expect(pinjamanService.getTagihanPinjamanByUser).toHaveBeenCalledWith('user-123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: mockTagihan });
        });

        it('should return 500 when service throws an error', async () => {
            // Arrange
            const error = new Error('Database error');
            (pinjamanService.getTagihanPinjamanByUser as jest.Mock).mockRejectedValue(error);

            // Act
            await getTagihanPinjaman(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
        });
    });

    describe('bayarTagihan', () => {
        it('should pay loan bill successfully', async () => {
            // Arrange
            req.params = { id: 'bill-123' };
            
            const mockResult = {
                tagihan_id: 'bill-123',
                statusTagihan: 'DIBAYAR',
                tanggalPembayaran: new Date()
            };
            
            (pinjamanService.bayarTagihanPinjaman as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await bayarTagihan(req as Request, res as Response);

            // Assert
            expect(pinjamanService.bayarTagihanPinjaman).toHaveBeenCalledWith('bill-123', 'user-123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Pembayaran tagihan berhasil',
                data: mockResult
            });
        });

        it('should return 400 when service throws an error', async () => {
            // Arrange
            req.params = { id: 'bill-999' };
            
            const error = new Error('Tagihan tidak ditemukan');
            (pinjamanService.bayarTagihanPinjaman as jest.Mock).mockRejectedValue(error);

            // Act
            await bayarTagihan(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400); // Changed from 500 to 400
            expect(res.json).toHaveBeenCalledWith({ message: 'Tagihan tidak ditemukan' });
        });
    });

    describe('claimPinjaman', () => {
        it('should claim loan successfully', async () => {
            // Arrange
            req.params = { pinjaman_id: 'loan-123' };
            
            const mockResult = {
                success: true,
                message: 'Dana pinjaman berhasil diklaim',
                data: {
                    pinjaman_id: 'loan-123',
                    jumlahPinjaman: 5000000,
                    statusPinjaman: 'ACTIVE'
                }
            };
            
            (pinjamanService.claimPinjamanService as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await claimPinjaman(req as Request, res as Response);

            // Assert
            expect(pinjamanService.claimPinjamanService).toHaveBeenCalledWith('user-123', 'loan-123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should return 400 when service throws an error', async () => {
            // Arrange
            req.params = { pinjaman_id: 'loan-999' };
            
            const error = new Error('Pinjaman tidak dapat diklaim');
            (pinjamanService.claimPinjamanService as jest.Mock).mockRejectedValue(error);

            // Act
            await claimPinjaman(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Pinjaman tidak dapat diklaim' });
        });
    });

    describe('getPinjamanStatus', () => {
        it('should get loan status successfully', async () => {
            // Arrange
            const mockStatus = [
                {
                    pinjaman_id: 'loan-123',
                    jumlahPinjaman: 5000000,
                    statusPinjaman: 'ACTIVE',
                    tanggalPengajuan: new Date(),
                    statusJatuhTempo: '12BULAN'
                }
            ];
            
            (pinjamanService.getPinjamanStatusService as jest.Mock).mockResolvedValue(mockStatus);

            // Act
            await getPinjamanStatus(req as Request, res as Response);

            // Assert
            expect(pinjamanService.getPinjamanStatusService).toHaveBeenCalledWith('user-123');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: mockStatus });
        });

        it('should return 500 when service throws an error', async () => {
            // Arrange
            const error = new Error('Database error');
            (pinjamanService.getPinjamanStatusService as jest.Mock).mockRejectedValue(error);

            // Act
            await getPinjamanStatus(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
        });
    });
});