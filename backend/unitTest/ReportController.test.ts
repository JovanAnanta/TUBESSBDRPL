import { Request, Response } from 'express';
import { createReport } from '../controller/ReportController';
import * as ReportService from '../service/ReportService';
import { mockRequest, mockResponse } from './Setup';

// Fix the mock path - this should point to the actual service location
jest.mock('../service/ReportService');

describe('ReportController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        req.user = { id: '123' };
        res = mockResponse();
        jest.clearAllMocks();
    });

    it('should create report successfully', async () => {
        // Arrange
        req.body = {
            email: 'test@example.com',
            deskripsi: 'This is a test report'
        };

        const mockReport = {
            nasabah_id: '123',
            email: 'test@example.com',
            deskripsi: 'This is a test report',
            status: 'DIPROSES'
        };

        (ReportService.createReport as jest.Mock).mockResolvedValue(mockReport);

        // Act
        await createReport(req as Request, res as Response);

        // Assert
        expect(ReportService.createReport).toHaveBeenCalledWith(
            '123',
            'test@example.com',
            'This is a test report'
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockReport);
    });

    it('should return 401 if nasabah_id is missing', async () => {
        // Arrange
        req.user = undefined;  // No user object
        req.body = {
            email: 'test@example.com',
            deskripsi: 'This is a test report'
        };

        // Act
        await createReport(req as Request, res as Response);

        // Assert
        expect(ReportService.createReport).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Nasabah tidak terautentikasi' });
    });

    it('should return 401 if user id is not a string', async () => {
        // Arrange
        req.user = { id: 123 };  // ID is a number, not a string
        req.body = {
            email: 'test@example.com',
            deskripsi: 'This is a test report'
        };

        // Act
        await createReport(req as Request, res as Response);

        // Assert
        expect(ReportService.createReport).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Nasabah tidak terautentikasi' });
    });

    it('should return 400 if email is missing', async () => {
        // Arrange
        req.body = { deskripsi: 'This is a test report' };

        // Act
        await createReport(req as Request, res as Response);

        // Assert
        expect(ReportService.createReport).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email dan deskripsi harus diisi' });
    });

    it('should return 400 if deskripsi is missing', async () => {
        // Arrange
        req.body = { email: 'test@example.com' };

        // Act
        await createReport(req as Request, res as Response);

        // Assert
        expect(ReportService.createReport).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Email dan deskripsi harus diisi' });
    });

    it('should return 500 when service throws an error', async () => {
        // Arrange
        req.body = {
            email: 'test@example.com',
            deskripsi: 'This is a test report'
        };

        const error = new Error('Database error');
        (ReportService.createReport as jest.Mock).mockRejectedValue(error);

        // Act
        await createReport(req as Request, res as Response);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Gagal membuat report',
            error
        });
    });
});