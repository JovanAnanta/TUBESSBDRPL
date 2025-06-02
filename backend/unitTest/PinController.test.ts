import { Request, Response } from 'express';
import { setPin, verifyPin } from '../controller/PinController';
import * as pinService from '../service/PinService';
import { mockRequest, mockResponse } from './Setup';

// Mock dependencies
jest.mock('../service/PinService');

describe('PinController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('setPin', () => {
        it('should set PIN successfully', async () => {
            // Arrange
            req.body = { nasabahId: '123', pin: '123456' };
            const mockResult = {
                success: true,
                message: 'PIN berhasil dibuat'
            };
            (pinService.setPinNasabah as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await setPin(req as Request, res as Response);

            // Assert
            expect(pinService.setPinNasabah).toHaveBeenCalledWith('123', '123456');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should return 400 when service throws an error', async () => {
            // Arrange
            req.body = { nasabahId: '123', pin: '12345' };
            const error = new Error('PIN harus 6 digit angka');
            (pinService.setPinNasabah as jest.Mock).mockRejectedValue(error);

            // Act
            await setPin(req as Request, res as Response);

            // Assert
            expect(pinService.setPinNasabah).toHaveBeenCalledWith('123', '12345');
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'PIN harus 6 digit angka' });
        });

        it('should return 500 for unexpected errors', async () => {
            // Arrange
            req.body = { nasabahId: '123', pin: '123456' };
            (pinService.setPinNasabah as jest.Mock).mockRejectedValue({});

            // Act
            await setPin(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
        });
    });

    describe('verifyPin', () => {
        it('should verify PIN successfully', async () => {
            // Arrange
            req.body = { nasabahId: '123', pin: '123456' };
            const mockResult = {
                success: true,
                message: 'PIN valid',
                remainingAttempts: 3
            };
            (pinService.verifyPin as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await verifyPin(req as Request, res as Response);

            // Assert
            expect(pinService.verifyPin).toHaveBeenCalledWith('123', '123456');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });

        it('should return 400 for missing nasabahId', async () => {
            // Arrange
            req.body = { pin: '123456' };

            // Act
            await verifyPin(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'nasabahId dan pin harus diisi'
            });
        });

        it('should return 400 for missing pin', async () => {
            // Arrange
            req.body = { nasabahId: '123' };

            // Act
            await verifyPin(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'nasabahId dan pin harus diisi'
            });
        });

        it('should return 401 for invalid PIN', async () => {
            // Arrange
            req.body = { nasabahId: '123', pin: '111111' };
            const mockResult = {
                success: false,
                message: 'PIN tidak valid',
                remainingAttempts: 2
            };
            (pinService.verifyPin as jest.Mock).mockResolvedValue(mockResult);

            // Act
            await verifyPin(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(mockResult);
        });
    });
});