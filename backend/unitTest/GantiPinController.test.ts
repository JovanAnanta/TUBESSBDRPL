import { Request, Response } from 'express';
import { gantiPin } from '../controller/GantiPinController';
import * as gantiPinService from '../service/GantiPinService';
import { mockRequest, mockResponse } from './Setup';

// Mock dependencies
jest.mock('../service/GantiPinService');

describe('GantiPinController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        req.user = { id: '123' };
        res = mockResponse();
        jest.clearAllMocks();
    });

    it('should change PIN successfully', async () => {
        // Arrange
        req.body = { oldPin: '123456', newPin: '654321' };
        const mockResult = {
            success: true,
            message: 'PIN berhasil diubah'
        };
        (gantiPinService.gantiPin as jest.Mock).mockResolvedValue(mockResult);

        // Act
        await gantiPin(req as Request, res as Response);

        // Assert
        expect(gantiPinService.gantiPin).toHaveBeenCalledWith('123', '123456', '654321');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 if old PIN is missing', async () => {
        // Arrange
        req.body = { newPin: '654321' };

        // Act
        await gantiPin(req as Request, res as Response);

        // Assert
        expect(gantiPinService.gantiPin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'PIN lama dan baru harus diisi.' });
    });

    it('should return 400 if new PIN is missing', async () => {
        // Arrange
        req.body = { oldPin: '123456' };

        // Act
        await gantiPin(req as Request, res as Response);

        // Assert
        expect(gantiPinService.gantiPin).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'PIN lama dan baru harus diisi.' });
    });

    it('should return 400 when service throws an error', async () => {
        // Arrange
        req.body = { oldPin: '123456', newPin: '654321' };
        const error = new Error('PIN lama tidak cocok');
        (gantiPinService.gantiPin as jest.Mock).mockRejectedValue(error);

        // Act
        await gantiPin(req as Request, res as Response);

        // Assert
        expect(gantiPinService.gantiPin).toHaveBeenCalledWith('123', '123456', '654321');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'PIN lama tidak cocok' });
    });
});