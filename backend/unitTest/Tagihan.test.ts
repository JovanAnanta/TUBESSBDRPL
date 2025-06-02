import { Request, Response } from 'express';
import { TagihanController } from '../controller/TagihanController';
import * as pinService from '../service/PinService';
import { TagihanService } from '../service/TagihanService';
import { mockRequest, mockResponse } from './Setup';

// Mock dependencies
jest.mock('../../service/TagihanService');
jest.mock('../../service/PinService');

describe('TagihanController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        req.user = { id: '123' };
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('bayarTagihanAir', () => {
        it('should pay water bill successfully', async () => {
            // Arrange
            req.body = {
                nomorTagihan: 'AIR123456',
                jumlahBayar: 150000,
                pin: '123456'
            };

            const mockResult = {
                success: true,
                message: 'Pembayaran tagihan air berhasil',
                data: {
                    transaksi_id: 'txn-1',
                    nasabah_id: '123',
                    statusTagihanType: 'AIR',
                    nomorTagihan: 'AIR123456',
                    jumlahBayar: 150000,
                    saldoSebelum: 1000000,
                    saldoSesudah: 850000,
                    tanggalTransaksi: new Date(),
                    keterangan: 'Pembayaran Tagihan AIR - AIR123456'
                }
            };

            (TagihanService.bayarTagihan as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await TagihanController.bayarTagihanAir(req as Request, res as Response);

            // Assert
            expect(TagihanService.bayarTagihan).toHaveBeenCalledWith(
                '123', 'AIR123456', 150000, '123456', 'AIR'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should return 401 if nasabahId is missing', async () => {
            // Arrange
            req.user = {};  // No ID
            req.body = {
                nomorTagihan: 'AIR123456',
                jumlahBayar: 150000,
                pin: '123456'
            };

            // Act
            await TagihanController.bayarTagihanAir(req as Request, res as Response);

            // Assert
            expect(TagihanService.bayarTagihan).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Unauthorized: User ID tidak ditemukan'
            });
        });

        it('should return 400 if nomorTagihan is missing', async () => {
            // Arrange
            req.body = {
                jumlahBayar: 150000,
                pin: '123456'
            };

            // Act
            await TagihanController.bayarTagihanAir(req as Request, res as Response);

            // Assert
            expect(TagihanService.bayarTagihan).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Nomor tagihan, jumlah bayar, dan PIN harus diisi'
            });
        });

        it('should return 400 if jumlahBayar is not positive', async () => {
            // Arrange
            req.body = {
                nomorTagihan: 'AIR123456',
                jumlahBayar: 0,
                pin: '123456'
            };

            // Act
            await TagihanController.bayarTagihanAir(req as Request, res as Response);

            // Assert
            expect(TagihanService.bayarTagihan).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Jumlah pembayaran harus lebih dari 0'
            });
        });

        it('should handle error with PIN information', async () => {
            // Arrange
            req.body = {
                nomorTagihan: 'AIR123456',
                jumlahBayar: 150000,
                pin: '111111'
            };

            const error = new Error('PIN tidak valid');
            (TagihanService.bayarTagihan as jest.Mock).mockRejectedValue(error);
            (pinService.getRemainingAttempts as jest.Mock).mockReturnValue(2);
            (pinService.isAccountBlocked as jest.Mock).mockReturnValue(false);

            // Act
            await TagihanController.bayarTagihanAir(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'PIN tidak valid',
                remainingAttempts: 2,
                isBlocked: false
            });
        });
    });

    describe('bayarTagihanListrik', () => {
        it('should pay electricity bill successfully', async () => {
            // Arrange
            req.body = {
                nomorTagihan: 'PLN123456',
                jumlahBayar: 250000,
                pin: '123456'
            };

            const mockResult = {
                success: true,
                message: 'Pembayaran tagihan listrik berhasil',
                data: {
                    transaksi_id: 'txn-1',
                    nasabah_id: '123',
                    statusTagihanType: 'LISTRIK',
                    nomorTagihan: 'PLN123456',
                    jumlahBayar: 250000,
                    saldoSebelum: 1000000,
                    saldoSesudah: 750000,
                    tanggalTransaksi: new Date(),
                    keterangan: 'Pembayaran Tagihan LISTRIK - PLN123456'
                }
            };

            (TagihanService.bayarTagihan as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await TagihanController.bayarTagihanListrik(req as Request, res as Response);

            // Assert
            expect(TagihanService.bayarTagihan).toHaveBeenCalledWith(
                '123', 'PLN123456', 250000, '123456', 'LISTRIK'
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });
    });

    describe('getBillAmount', () => {
        it('should return bill amount for water bill', async () => {
            // Arrange
            req.params = {
                type: 'air',
                nomorTagihan: 'AIR123456'
            };

            const mockAmount = 150000;
            (TagihanService.getDummyBillAmount as jest.Mock).mockReturnValue(mockAmount);

            // Act
            await TagihanController.getBillAmount(req as Request, res as Response);

            // Assert
            expect(TagihanService.getDummyBillAmount).toHaveBeenCalledWith('air', 'AIR123456');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ amount: mockAmount });
        });

        it('should return bill amount for electricity bill', async () => {
            // Arrange
            req.params = {
                type: 'listrik',
                nomorTagihan: 'PLN123456'
            };

            const mockAmount = 250000;
            (TagihanService.getDummyBillAmount as jest.Mock).mockReturnValue(mockAmount);

            // Act
            await TagihanController.getBillAmount(req as Request, res as Response);

            // Assert
            expect(TagihanService.getDummyBillAmount).toHaveBeenCalledWith('listrik', 'PLN123456');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ amount: mockAmount });
        });
    });
});