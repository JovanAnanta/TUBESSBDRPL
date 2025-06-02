import { Request, Response } from 'express';
import { gantiPasswordController } from '../controller/GantiPasswordController';
import * as gantiPasswordService from '../service/GantiPasswordService';
import { mockRequest, mockResponse } from './Setup';

// Mock dependencies
jest.mock('../service/GantiPasswordService');

describe('GantiPasswordController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    it('should change password successfully', async () => {
        // Arrange
        req.user = { id: '123' };
        req.body = { oldPassword: 'oldpass123', newPassword: 'newpass123' };

        const mockUserData = {
            id: '123',
            email: 'encrypted_email',
            nama: 'encrypted_name'
        };

        (gantiPasswordService.gantiPassword as jest.Mock).mockResolvedValue(mockUserData);

        // Act
        await gantiPasswordController(req as Request, res as Response);

        // Assert
        expect(gantiPasswordService.gantiPassword).toHaveBeenCalledWith('123', 'oldpass123', 'newpass123');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Password berhasil diganti',
            data: mockUserData
        });
    });

    it('should return 400 when data is incomplete', async () => {
        // Arrange - missing oldPassword
        req.user = { id: '123' };
        req.body = { newPassword: 'newpass123' };

        // Act
        await gantiPasswordController(req as Request, res as Response);

        // Assert
        expect(gantiPasswordService.gantiPassword).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Data tidak lengkap' });
    });

    it('should return 400 when old password is incorrect', async () => {
        // Arrange
        req.user = { id: '123' };
        req.body = { oldPassword: 'wrongpass', newPassword: 'newpass123' };

        const error = new Error('Password lama tidak cocok');
        (gantiPasswordService.gantiPassword as jest.Mock).mockRejectedValue(error);

        // Act
        await gantiPasswordController(req as Request, res as Response);

        // Assert
        expect(gantiPasswordService.gantiPassword).toHaveBeenCalledWith('123', 'wrongpass', 'newpass123');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Password lama tidak cocok' });
    });

    it('should return 400 when new password is the same as old password', async () => {
        // Arrange
        req.user = { id: '123' };
        req.body = { oldPassword: 'samepass', newPassword: 'samepass' };

        const error = new Error('Password baru tidak boleh sama dengan password lama');
        (gantiPasswordService.gantiPassword as jest.Mock).mockRejectedValue(error);

        // Act
        await gantiPasswordController(req as Request, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Password baru tidak boleh sama dengan password lama'
        });
    });
});