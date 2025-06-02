import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getEReceipt, topUp, topUpWithPin, transferWithPin } from '../controller/TransferController';
import { encrypt } from '../enkripsi/Encryptor';
import { Credit } from '../models/Credit';
import { Debit } from '../models/Debit';
import { Nasabah } from '../models/Nasabah';
import { Transaksi } from '../models/Transaksi';
import { Transfer } from '../models/Transfer';
import * as pinService from '../service/PinService';
import { mockRequest, mockResponse } from './Setup';

// Mock dependencies
jest.mock('../models/Transaksi');
jest.mock('../models/Credit');
jest.mock('../models/Debit');
jest.mock('../models/Transfer');
jest.mock('../models/Nasabah');
jest.mock('../service/PinService');
jest.mock('../enkripsi/Encryptor');
jest.mock('uuid');

describe('TransferController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();

        // Common mock for uuidv4
        (uuidv4 as jest.Mock).mockReturnValue('mock-uuid');
    });

    describe('getEReceipt', () => {
        it('should fetch transaction receipt details successfully', async () => {
            // Arrange
            req.params = { transaksiId: 'txn-1' };

            const mockTransaksi = {
                toJSON: jest.fn().mockReturnValue({
                    transaksi_id: 'txn-1',
                    nasabah_id: '123',
                    transaksiType: 'MASUK',
                    tanggalTransaksi: new Date(),
                    keterangan: 'TOP UP'
                })
            };

            const mockCredit = {
                toJSON: jest.fn().mockReturnValue({
                    credit_id: 'crd-1',
                    transaksi_id: 'txn-1',
                    jumlahSaldoBertambah: 100000
                })
            };

            const mockDebit = {
                toJSON: jest.fn().mockReturnValue({
                    debit_id: 'dbt-1',
                    transaksi_id: 'txn-1',
                    jumlahSaldoBerkurang: 100000
                })
            };

            const mockTransfers = [{
                toJSON: jest.fn().mockReturnValue({
                    transfer_id: 'trf-1',
                    transaksi_id: 'txn-1',
                    fromRekening: 'encrypted-rekening-123',
                    toRekening: 'encrypted-rekening-456',
                    berita: 'Test transfer'
                })
            }];

            (Transaksi.findByPk as jest.Mock).mockResolvedValue(mockTransaksi);
            (Credit.findOne as jest.Mock).mockResolvedValue(mockCredit);
            (Debit.findOne as jest.Mock).mockResolvedValue(mockDebit);
            (Transfer.findAll as jest.Mock).mockResolvedValue(mockTransfers);

            // Act
            await getEReceipt(req as Request, res as Response);

            // Assert
            expect(Transaksi.findByPk).toHaveBeenCalledWith('txn-1');
            expect(Credit.findOne).toHaveBeenCalledWith({ where: { transaksi_id: 'txn-1' } });
            expect(Debit.findOne).toHaveBeenCalledWith({ where: { transaksi_id: 'txn-1' } });
            expect(Transfer.findAll).toHaveBeenCalledWith({ where: { transaksi_id: 'txn-1' } });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    transaksi: expect.any(Object),
                    credit: expect.any(Object),
                    debit: expect.any(Object),
                    transfers: expect.any(Array)
                }
            });
        });

        it('should return 400 if transaksiId is missing', async () => {
            // Arrange
            req.params = {};

            // Act
            await getEReceipt(req as Request, res as Response);

            // Assert
            expect(Transaksi.findByPk).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'transaksiId harus diisi'
            });
        });

        it('should return 404 if transaction is not found', async () => {
            // Arrange
            req.params = { transaksiId: 'txn-999' };
            (Transaksi.findByPk as jest.Mock).mockResolvedValue(null);

            // Act
            await getEReceipt(req as Request, res as Response);

            // Assert
            expect(Transaksi.findByPk).toHaveBeenCalledWith('txn-999');
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Transaksi tidak ditemukan'
            });
        });

        it('should handle errors properly', async () => {
            // Arrange
            req.params = { transaksiId: 'txn-1' };
            const error = new Error('Database error');
            (Transaksi.findByPk as jest.Mock).mockRejectedValue(error);

            // Act
            await getEReceipt(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Terjadi kesalahan sistem'
            });
        });
    });

    describe('topUp', () => {
        it('should top up successfully with query parameter', async () => {
            // Arrange
            req.query = { nasabahId: 'user-123' };
            req.body = { amount: 5000000 };

            const mockNasabah = {
                nasabah_id: 'user-123',
                saldo: 1000000,
                save: jest.fn().mockResolvedValue(true)
            };

            const mockTransaksi = {
                transaksi_id: 'txn-topup-1',
            };

            (Nasabah.findOne as jest.Mock).mockResolvedValue(mockNasabah);
            (Transaksi.create as jest.Mock).mockResolvedValue(mockTransaksi);
            (Credit.create as jest.Mock).mockResolvedValue({});

            // Act
            await topUp(req as Request, res as Response);

            // Assert
            expect(Nasabah.findOne).toHaveBeenCalledWith({ where: { nasabah_id: 'user-123' } });
            expect(Transaksi.create).toHaveBeenCalledWith({
                nasabah_id: 'user-123',
                transaksiType: 'MASUK',
                tanggalTransaksi: expect.any(Date),
                keterangan: 'TOP UP'
            });
            expect(Credit.create).toHaveBeenCalledWith({
                credit_id: expect.any(String),
                transaksi_id: 'txn-topup-1',
                jumlahSaldoBertambah: 5000000
            });
            expect(mockNasabah.save).toHaveBeenCalled();
            expect(mockNasabah.saldo).toBe(6000000);  // 1000000 + 5000000
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: expect.stringContaining('Top up sebesar 5000000'),
                data: { transaksi_id: 'txn-topup-1' }
            });
        });

        it('should return 400 when amount is missing', async () => {
            // Arrange
            req.query = { nasabahId: 'user-123' };
            req.body = {}; // Missing amount

            // Act
            await topUp(req as Request, res as Response);

            // Assert
            expect(Nasabah.findOne).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'nasabahId dan amount harus diisi'
            });
        });

        it('should return 400 when amount is negative', async () => {
            // Arrange
            req.query = { nasabahId: 'user-123' };
            req.body = { amount: -1000 };

            // Act
            await topUp(req as Request, res as Response);

            // Assert
            expect(Nasabah.findOne).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Amount harus berupa angka positif'
            });
        });

        it('should return 400 when amount exceeds maximum', async () => {
            // Arrange
            req.query = { nasabahId: 'user-123' };
            req.body = { amount: 15000000 }; // Exceeds 10M limit

            const mockNasabah = {
                nasabah_id: 'user-123',
                saldo: 1000000
            };

            (Nasabah.findOne as jest.Mock).mockResolvedValue(mockNasabah);

            // Act
            await topUp(req as Request, res as Response);

            // Assert
            expect(Nasabah.findOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Jumlah top up tidak boleh lebih dari 10.000.000'
            });
        });
    });

    describe('topUpWithPin', () => {
        it('should top up successfully with PIN verification', async () => {
            // Arrange
            req.body = {
                nasabahId: 'user-123',
                amount: 5000000,
                pin: '123456'
            };

            const mockNasabah = {
                nasabah_id: 'user-123',
                saldo: 1000000,
                save: jest.fn().mockResolvedValue(true)
            };

            const mockTransaksi = {
                transaksi_id: 'txn-topup-2',
            };

            (pinService.verifyPin as jest.Mock).mockResolvedValue({ success: true });
            (Nasabah.findOne as jest.Mock).mockResolvedValue(mockNasabah);
            (Transaksi.create as jest.Mock).mockResolvedValue(mockTransaksi);
            (Credit.create as jest.Mock).mockResolvedValue({});

            // Act
            await topUpWithPin(req as Request, res as Response);

            // Assert
            expect(pinService.verifyPin).toHaveBeenCalledWith('user-123', '123456');
            expect(Nasabah.findOne).toHaveBeenCalledWith({ where: { nasabah_id: 'user-123' } });
            expect(Transaksi.create).toHaveBeenCalled();
            expect(Credit.create).toHaveBeenCalled();
            expect(mockNasabah.save).toHaveBeenCalled();
            expect(mockNasabah.saldo).toBe(6000000);  // 1000000 + 5000000
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { transaksi_id: 'txn-topup-2' }
            });
        });

        it('should return 401 when PIN is invalid', async () => {
            // Arrange
            req.body = {
                nasabahId: 'user-123',
                amount: 5000000,
                pin: '111111'
            };

            (pinService.verifyPin as jest.Mock).mockResolvedValue({ success: false });

            // Act
            await topUpWithPin(req as Request, res as Response);

            // Assert
            expect(pinService.verifyPin).toHaveBeenCalledWith('user-123', '111111');
            expect(Nasabah.findOne).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'PIN salah'
            });
        });
    });

    describe('transferWithPin', () => {
        it('should transfer funds successfully with PIN verification', async () => {
            // Arrange
            req.body = {
                nasabahId: 'sender-123',
                toRekening: '123456789',
                amount: 500000,
                note: 'Test transfer',
                pin: '123456'
            };

            const mockSender = {
                nasabah_id: 'sender-123',
                noRekening: 'encrypted-sender-rekening',
                saldo: 1000000,
                save: jest.fn().mockResolvedValue(true)
            };

            const mockReceiver = {
                nasabah_id: 'receiver-456',
                noRekening: 'encrypted-receiver-rekening',
                saldo: 500000,
                save: jest.fn().mockResolvedValue(true)
            };

            const mockTransaksiSender = {
                transaksi_id: 'txn-send-1',
            };

            const mockTransaksiReceiver = {
                transaksi_id: 'txn-recv-1',
            };

            (pinService.verifyPin as jest.Mock).mockResolvedValue({ success: true });
            (encrypt as jest.Mock).mockReturnValue('encrypted-receiver-rekening');
            (Nasabah.findOne as jest.Mock)
                .mockResolvedValueOnce(mockSender)  // First call for sender
                .mockResolvedValueOnce(mockReceiver); // Second call for receiver

            (Transaksi.create as jest.Mock)
                .mockResolvedValueOnce(mockTransaksiSender)
                .mockResolvedValueOnce(mockTransaksiReceiver);

            (Transfer.create as jest.Mock).mockResolvedValue({});
            (Debit.create as jest.Mock).mockResolvedValue({});
            (Credit.create as jest.Mock).mockResolvedValue({});

            // Act
            await transferWithPin(req as Request, res as Response);

            // Assert
            expect(pinService.verifyPin).toHaveBeenCalledWith('sender-123', '123456');
            expect(encrypt).toHaveBeenCalledWith('123456789');
            expect(Nasabah.findOne).toHaveBeenCalledTimes(2);

            // Check transaction creation
            expect(Transaksi.create).toHaveBeenCalledTimes(2);
            expect(Transfer.create).toHaveBeenCalledTimes(2);
            expect(Debit.create).toHaveBeenCalledWith({
                debit_id: expect.any(String),
                transaksi_id: 'txn-send-1',
                jumlahSaldoBerkurang: 500000
            });
            expect(Credit.create).toHaveBeenCalledWith({
                credit_id: expect.any(String),
                transaksi_id: 'txn-recv-1',
                jumlahSaldoBertambah: 500000
            });

            // Check balance updates
            expect(mockSender.saldo).toBe(500000);  // 1000000 - 500000
            expect(mockReceiver.saldo).toBe(1000000);  // 500000 + 500000
            expect(mockSender.save).toHaveBeenCalled();
            expect(mockReceiver.save).toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: { transaksi_id: 'txn-send-1' }
            });
        });

        it('should return 400 when required fields are missing', async () => {
            // Arrange
            req.body = {
                nasabahId: 'sender-123',
                amount: 500000,
                pin: '123456'
                // Missing toRekening
            };

            // Act
            await transferWithPin(req as Request, res as Response);

            // Assert
            expect(pinService.verifyPin).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'nasabahId, toRekening, amount, dan pin harus diisi'
            });
        });

        it('should return 403 when PIN is invalid', async () => {
            // Arrange
            req.body = {
                nasabahId: 'sender-123',
                toRekening: '123456789',
                amount: 500000,
                note: 'Test transfer',
                pin: '111111'
            };

            (pinService.verifyPin as jest.Mock).mockResolvedValue({ success: false });

            // Act
            await transferWithPin(req as Request, res as Response);

            // Assert
            expect(pinService.verifyPin).toHaveBeenCalledWith('sender-123', '111111');
            expect(Nasabah.findOne).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'PIN salah'
            });
        });

        it('should return 400 when sender has insufficient balance', async () => {
            // Arrange
            req.body = {
                nasabahId: 'sender-123',
                toRekening: '123456789',
                amount: 2000000,  // More than balance
                note: 'Test transfer',
                pin: '123456'
            };

            const mockSender = {
                nasabah_id: 'sender-123',
                noRekening: 'encrypted-sender-rekening',
                saldo: 1000000
            };

            const mockReceiver = {
                nasabah_id: 'receiver-456',
                noRekening: 'encrypted-receiver-rekening',
                saldo: 500000
            };

            (pinService.verifyPin as jest.Mock).mockResolvedValue({ success: true });
            (encrypt as jest.Mock).mockReturnValue('encrypted-receiver-rekening');
            (Nasabah.findOne as jest.Mock)
                .mockResolvedValueOnce(mockSender)
                .mockResolvedValueOnce(mockReceiver);

            // Act
            await transferWithPin(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Saldo tidak mencukupi'
            });
        });
    });
});