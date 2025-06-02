import { Request, Response } from 'express';
import { TagihanController } from '../controller/TagihanController';
import { Debit } from '../models/Debit';
import { Nasabah } from '../models/Nasabah';
import { Tagihan } from '../models/Tagihan';
import { Transaksi } from '../models/Transaksi';
import * as pinService from '../service/PinService';
import { TagihanService } from '../service/TagihanService';

// Mock dependencies
jest.mock('../models/Nasabah');
jest.mock('../models/Transaksi');
jest.mock('../models/Tagihan');
jest.mock('../models/Debit');
jest.mock('../service/PinService');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid')
}));

describe('TagihanService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateNomorTagihan', () => {
        test('should validate correct water bill number format', () => {
            expect(TagihanService.validateNomorTagihan('12345678', 'AIR')).toBe(true);
            expect(TagihanService.validateNomorTagihan('PDAM12345678', 'AIR')).toBe(true);
            expect(TagihanService.validateNomorTagihan('pdam 12345678', 'AIR')).toBe(true);
        });

        test('should validate correct electricity bill number format', () => {
            expect(TagihanService.validateNomorTagihan('12345678', 'LISTRIK')).toBe(true);
            expect(TagihanService.validateNomorTagihan('PLN12345678', 'LISTRIK')).toBe(true);
            expect(TagihanService.validateNomorTagihan('pln 12345678', 'LISTRIK')).toBe(true);
        });

        test('should reject invalid bill number format', () => {
            expect(TagihanService.validateNomorTagihan('123456', 'AIR')).toBe(false); // Too short
            expect(TagihanService.validateNomorTagihan('1234567890123456', 'LISTRIK')).toBe(false); // Too long
            expect(TagihanService.validateNomorTagihan('PLN-12345', 'LISTRIK')).toBe(false); // Has non-numeric chars
            expect(TagihanService.validateNomorTagihan('PLN12345678', 'AIR')).toBe(false); // Wrong prefix for type
            expect(TagihanService.validateNomorTagihan('PDAM12345678', 'LISTRIK')).toBe(false); // Wrong prefix for type
        });
    });

    describe('formatNomorTagihan', () => {
        test('should format water bill numbers correctly', () => {
            expect(TagihanService.formatNomorTagihan('12345678', 'AIR')).toBe('1234-5678');
            expect(TagihanService.formatNomorTagihan('PDAM12345678', 'AIR')).toBe('PDAM 1234-5678');
            expect(TagihanService.formatNomorTagihan('123456789', 'AIR')).toBe('1234-5678-9');
        });

        test('should format electricity bill numbers correctly', () => {
            expect(TagihanService.formatNomorTagihan('12345678', 'LISTRIK')).toBe('1234-5678');
            expect(TagihanService.formatNomorTagihan('PLN12345678', 'LISTRIK')).toBe('PLN 1234-5678');
            expect(TagihanService.formatNomorTagihan('123456789012', 'LISTRIK')).toBe('1234-5678-9012');
        });
    });

    describe('generateDummyAmount', () => {
        test('should generate consistent amount for same bill number', () => {
            const amount1 = TagihanService.generateDummyAmount('12345678');
            const amount2 = TagihanService.generateDummyAmount('12345678');
            expect(amount1).toBe(amount2);
        });

        test('should generate amount within expected range', () => {
            const amount = TagihanService.generateDummyAmount('12345678');
            expect(amount).toBeGreaterThanOrEqual(50000);
            expect(amount).toBeLessThanOrEqual(500000);
            expect(amount % 1000).toBe(0); // Should be rounded to thousands
        });
    });

    describe('getTagihanInfo', () => {
        test('should return tagihan info with dummy data', async () => {
            const result = await TagihanService.getTagihanInfo('12345678', 'AIR');

            expect(result.success).toBe(true);
            expect(result.data).toHaveProperty('nomorTagihan', '12345678');
            expect(result.data).toHaveProperty('type', 'AIR');
            expect(result.data).toHaveProperty('amount');
            expect(result.data).toHaveProperty('customerName');
            expect(result.data).toHaveProperty('customerAddress');
            expect(result.data).toHaveProperty('periode');
            expect(result.data).toHaveProperty('tarif');
            expect(result.data).toHaveProperty('dueDate');
            expect(result.data).toHaveProperty('status', 'BELUM LUNAS');
        });

        test('should throw error for invalid bill number', async () => {
            await expect(TagihanService.getTagihanInfo('123', 'AIR')).rejects.toThrow();
        });
    });

    describe('bayarTagihan', () => {
        const mockNasabah = {
            saldo: 1000000,
            status: 'AKTIF',
            update: jest.fn().mockResolvedValue(true)
        };

        const mockTransaction = {
            commit: jest.fn().mockResolvedValue(true),
            rollback: jest.fn().mockResolvedValue(true)
        };

        const mockTransaksi = {
            transaksi_id: 'mock-uuid',
            nasabah_id: '123',
            transaksiType: 'KELUAR',
            tanggalTransaksi: new Date(),
            keterangan: 'TAGIHAN AIR'
        };

        beforeEach(() => {
            (Nasabah.sequelize as any) = {
                transaction: jest.fn().mockResolvedValue(mockTransaction)
            };
            (Nasabah.findByPk as jest.Mock).mockResolvedValue(mockNasabah);
            (Transaksi.create as jest.Mock).mockResolvedValue(mockTransaksi);
            (Debit.create as jest.Mock).mockResolvedValue({});
            (Tagihan.create as jest.Mock).mockResolvedValue({});
            (pinService.verifyPin as jest.Mock).mockResolvedValue({ success: true });
        });

        test('should process valid water bill payment', async () => {
            const result = await TagihanService.bayarTagihan(
                '123', 'PDAM12345678', 100000, '123456', 'AIR'
            );

            // Verify result
            expect(result.success).toBe(true);
            expect(result.data.statusTagihanType).toBe('AIR');
            expect(result.data.nomorTagihan).toBe('PDAM12345678');
            expect(result.data.jumlahBayar).toBe(100000);
            expect(result.data.saldoSebelum).toBe(1000000);
            expect(result.data.saldoSesudah).toBe(900000);

            // Verify transaction flow
            expect(Nasabah.sequelize!.transaction).toHaveBeenCalled();
            expect(Nasabah.findByPk).toHaveBeenCalledWith('123', expect.any(Object));
            expect(pinService.verifyPin).toHaveBeenCalledWith('123', '123456');
            expect(Transaksi.create).toHaveBeenCalled();
            expect(Debit.create).toHaveBeenCalled();
            expect(Tagihan.create).toHaveBeenCalled();
            expect(mockNasabah.update).toHaveBeenCalledWith({ saldo: 900000 }, expect.any(Object));
            expect(mockTransaction.commit).toHaveBeenCalled();
        });

        test('should throw error for insufficient balance', async () => {
            (Nasabah.findByPk as jest.Mock).mockResolvedValue({
                ...mockNasabah,
                saldo: 50000
            });

            await expect(
                TagihanService.bayarTagihan('123', 'PDAM12345678', 100000, '123456', 'AIR')
            ).rejects.toThrow(/Saldo tidak mencukupi/);

            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        test('should throw error for invalid PIN', async () => {
            (pinService.verifyPin as jest.Mock).mockResolvedValue({
                success: false,
                message: 'PIN tidak valid'
            });

            await expect(
                TagihanService.bayarTagihan('123', 'PDAM12345678', 100000, '123456', 'AIR')
            ).rejects.toThrow(/PIN tidak valid/);

            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        test('should throw error for inactive account', async () => {
            (Nasabah.findByPk as jest.Mock).mockResolvedValue({
                ...mockNasabah,
                status: 'NONAKTIF'
            });

            await expect(
                TagihanService.bayarTagihan('123', 'PDAM12345678', 100000, '123456', 'AIR')
            ).rejects.toThrow(/Akun tidak aktif/);

            expect(mockTransaction.rollback).toHaveBeenCalled();
        });
    });

    describe('getRiwayatTagihan', () => {
        test('should get payment history for a user', async () => {
            const mockTransactions = [
                {
                    transaksi_id: 'trans-1',
                    tanggalTransaksi: new Date(),
                    keterangan: 'TAGIHAN AIR',
                    Tagihan: {
                        statusTagihanType: 'AIR',
                        nomorTagihan: 'PDAM12345678'
                    },
                    Debit: {
                        jumlahSaldoBerkurang: 100000
                    }
                }
            ];

            (Transaksi.findAll as jest.Mock).mockResolvedValue(mockTransactions);

            const result = await TagihanService.getRiwayatTagihan('123');

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0]).toHaveProperty('transaksi_id', 'trans-1');
            expect(result.data[0]).toHaveProperty('statusTagihanType', 'AIR');
            expect(result.data[0]).toHaveProperty('jumlahBayar', 100000);
            expect(Transaksi.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    nasabah_id: '123',
                    transaksiType: 'KELUAR'
                }
            }));
        });
    });

    describe('isTagihanSudahDibayar', () => {
        test('should return true if bill has been paid', async () => {
            (Transaksi.findOne as jest.Mock).mockResolvedValue({});

            const result = await TagihanService.isTagihanSudahDibayar(
                '123', 'PDAM12345678', 'AIR'
            );

            expect(result).toBe(true);
            expect(Transaksi.findOne).toHaveBeenCalled();
        });

        test('should return false if bill has not been paid', async () => {
            (Transaksi.findOne as jest.Mock).mockResolvedValue(null);

            const result = await TagihanService.isTagihanSudahDibayar(
                '123', 'PDAM12345678', 'AIR'
            );

            expect(result).toBe(false);
        });
    });

    describe('cekKelayakanBayarTagihan', () => {
        test('should return eligible=true for first-time payment', async () => {
            (Transaksi.findOne as jest.Mock).mockResolvedValue(null);

            const result = await TagihanService.cekKelayakanBayarTagihan(
                '123', 'PDAM12345678', 'AIR'
            );

            expect(result.eligible).toBe(true);
        });

        test('should return eligible=false if paid recently (< 30 days)', async () => {
            const lastPaymentDate = new Date();
            (Transaksi.findOne as jest.Mock).mockResolvedValue({
                tanggalTransaksi: lastPaymentDate
            });

            const result = await TagihanService.cekKelayakanBayarTagihan(
                '123', 'PDAM12345678', 'AIR'
            );

            expect(result.eligible).toBe(false);
            expect(result.message).toContain('sudah dibayar pada');
            expect(result.lastPaymentDate).toEqual(lastPaymentDate);
        });

        test('should return eligible=true if paid > 30 days ago', async () => {
            const lastPaymentDate = new Date();
            lastPaymentDate.setDate(lastPaymentDate.getDate() - 31); // 31 days ago

            (Transaksi.findOne as jest.Mock).mockResolvedValue({
                tanggalTransaksi: lastPaymentDate
            });

            const result = await TagihanService.cekKelayakanBayarTagihan(
                '123', 'PDAM12345678', 'AIR'
            );

            expect(result.eligible).toBe(true);
            expect(result.lastPaymentDate).toEqual(lastPaymentDate);
        });
    });
});

describe('TagihanController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonSpy: jest.Mock;
    let statusSpy: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();

        jsonSpy = jest.fn();
        statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

        mockRequest = {
            user: { id: 'user-123' },
            body: {},
            params: {}
        } as any;

        mockResponse = {
            status: statusSpy,
            json: jsonSpy
        };

        jest.spyOn(TagihanService, 'bayarTagihan').mockImplementation(async () => ({
            success: true,
            message: 'Pembayaran tagihan berhasil',
            data: {
                transaksi_id: 'mock-uuid',
                nasabah_id: 'user-123',
                statusTagihanType: 'AIR',
                nomorTagihan: 'PDAM12345678',
                jumlahBayar: 100000,
                saldoSebelum: 1000000,
                saldoSesudah: 900000,
                tanggalTransaksi: new Date(),
                keterangan: 'TAGIHAN AIR'
            }
        }));

        (pinService.getRemainingAttempts as jest.Mock).mockReturnValue(3);
        (pinService.isAccountBlocked as jest.Mock).mockReturnValue(false);
    });

    describe('bayarTagihanAir', () => {
        test('should return 401 if user not authenticated', async () => {
            mockRequest = {
                user: null,
                body: { nomorTagihan: 'PDAM123', jumlahBayar: 100, pin: '123456' }
            } as any;

            await TagihanController.bayarTagihanAir(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusSpy).toHaveBeenCalledWith(401);
            expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Unauthorized')
            }));
        });

        test('should return 400 if required fields missing', async () => {
            mockRequest.body = { nomorTagihan: '', jumlahBayar: 0, pin: '' };

            await TagihanController.bayarTagihanAir(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusSpy).toHaveBeenCalledWith(400);
        });

        test('should reject PLN prefix for water bill', async () => {
            mockRequest.body = {
                nomorTagihan: 'PLN12345678',
                jumlahBayar: 100000,
                pin: '123456'
            };

            await TagihanController.bayarTagihanAir(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusSpy).toHaveBeenCalledWith(400);
            expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('PLN prefix tidak valid')
            }));
        });

        test('should process valid water bill payment', async () => {
            mockRequest.body = {
                nomorTagihan: 'PDAM12345678',
                jumlahBayar: 100000,
                pin: '123456'
            };

            await TagihanController.bayarTagihanAir(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(TagihanService.bayarTagihan).toHaveBeenCalledWith(
                'user-123',
                'PDAM12345678',
                100000,
                '123456',
                'AIR'
            );
            expect(statusSpy).toHaveBeenCalledWith(200);
        });

        test('should include PIN attempt info in error response', async () => {
            mockRequest.body = {
                nomorTagihan: 'PDAM12345678',
                jumlahBayar: 100000,
                pin: '123456'
            };

            const error = new Error('PIN tidak valid');
            (TagihanService.bayarTagihan as jest.Mock).mockRejectedValue(error);

            await TagihanController.bayarTagihanAir(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusSpy).toHaveBeenCalledWith(400);
            expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'PIN tidak valid',
                remainingAttempts: 3,
                isBlocked: false
            }));
        });
    });

    describe('bayarTagihanListrik', () => {
        test('should reject PDAM prefix for electricity bill', async () => {
            mockRequest.body = {
                nomorTagihan: 'PDAM12345678',
                jumlahBayar: 100000,
                pin: '123456'
            };

            await TagihanController.bayarTagihanListrik(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusSpy).toHaveBeenCalledWith(400);
            expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('PDAM prefix tidak valid')
            }));
        });

        test('should process valid electricity bill payment', async () => {
            mockRequest.body = {
                nomorTagihan: 'PLN12345678',
                jumlahBayar: 100000,
                pin: '123456'
            };

            await TagihanController.bayarTagihanListrik(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(TagihanService.bayarTagihan).toHaveBeenCalledWith(
                'user-123',
                'PLN12345678',
                100000,
                '123456',
                'LISTRIK'
            );
            expect(statusSpy).toHaveBeenCalledWith(200);
        });
    });

    describe('getBillAmount', () => {
        test('should return dummy bill amount', async () => {
            mockRequest.params = {
                type: 'air',
                nomorTagihan: '12345678'
            };

            jest.spyOn(TagihanService, 'generateDummyAmount').mockReturnValue(100000);

            await TagihanController.getBillAmount(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusSpy).toHaveBeenCalledWith(200);
            expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Data tagihan ditemukan',
                data: expect.objectContaining({
                    nomorTagihan: '12345678',
                    amount: 100000,
                    type: 'AIR'
                })
            }));
        });

        test('should return 400 for invalid bill type', async () => {
            mockRequest.params = {
                type: 'invalid',
                nomorTagihan: '12345678'
            };

            await TagihanController.getBillAmount(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusSpy).toHaveBeenCalledWith(400);
        });
    });

    describe('cekKelayakanBayar', () => {
        beforeEach(() => {
            jest.spyOn(TagihanService, 'cekKelayakanBayarTagihan').mockResolvedValue({
                eligible: true
            });
        });

        test('should return eligibility check results', async () => {
            mockRequest.params = {
                type: 'air',
                nomorTagihan: '12345678'
            };

            await TagihanController.cekKelayakanBayar(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(TagihanService.cekKelayakanBayarTagihan).toHaveBeenCalledWith(
                'user-123',
                '12345678',
                'AIR'
            );
            expect(statusSpy).toHaveBeenCalledWith(200);
            expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                eligible: true,
                data: expect.objectContaining({
                    nomorTagihan: '12345678',
                    type: 'AIR',
                    canPay: true
                })
            }));
        });

        test('should return 401 if user not authenticated', async () => {
            mockRequest = {
                user: null,
                params: { type: 'air', nomorTagihan: '12345678' }
            } as any;

            await TagihanController.cekKelayakanBayar(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusSpy).toHaveBeenCalledWith(401);
        });

        test('should return 400 for invalid bill type', async () => {
            mockRequest.params = {
                type: 'invalid',
                nomorTagihan: '12345678'
            };

            await TagihanController.cekKelayakanBayar(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(statusSpy).toHaveBeenCalledWith(400);
        });
    });
});