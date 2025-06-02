import { Request, Response } from 'express';
import { lihatSemuaReport, ubahStatusReport } from '../controller/CSReportController';
import * as CSReportService from '../service/CSReportService';
import { mockRequest, mockResponse } from './Setup';

// Mock dependencies
jest.mock('../service/CSReportService');

describe('CSReportController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = mockRequest();
        res = mockResponse();
        jest.clearAllMocks();
    });

    describe('lihatSemuaReport', () => {
        it('should fetch all reports successfully', async () => {
            // Arrange
            const mockReports = [
                { id: '1', nasabah_id: '123', deskripsi: 'Report 1', status: 'MENUNGGU' },
                { id: '2', nasabah_id: '456', deskripsi: 'Report 2', status: 'MENUNGGU' }
            ];
            (CSReportService.getAllReports as jest.Mock).mockResolvedValue(mockReports);

            // Act
            await lihatSemuaReport(req as Request, res as Response);

            // Assert
            expect(CSReportService.getAllReports).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockReports);
        });

        it('should handle errors when fetching reports', async () => {
            // Arrange
            const error = new Error('Database error');
            (CSReportService.getAllReports as jest.Mock).mockRejectedValue(error);

            // Act
            await lihatSemuaReport(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Gagal mengambil laporan',
                error
            });
        });
    });

    describe('ubahStatusReport', () => {
        it('should update report status to DITERIMA', async () => {
            // Arrange
            req.params = { id: '1' };
            req.body = { status: 'DITERIMA' };

            const mockUpdated = {
                id: '1',
                nasabah_id: '123',
                deskripsi: 'Report 1',
                status: 'DITERIMA',
                updated_at: new Date()
            };

            (CSReportService.updateReportStatus as jest.Mock).mockResolvedValue(mockUpdated);

            // Act
            await ubahStatusReport(req as Request, res as Response);

            // Assert
            expect(CSReportService.updateReportStatus).toHaveBeenCalledWith('1', 'DITERIMA');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdated);
        });

        it('should update report status to DIABAIKAN', async () => {
            // Arrange
            req.params = { id: '1' };
            req.body = { status: 'DIABAIKAN' };

            const mockUpdated = {
                id: '1',
                nasabah_id: '123',
                deskripsi: 'Report 1',
                status: 'DIABAIKAN',
                updated_at: new Date()
            };

            (CSReportService.updateReportStatus as jest.Mock).mockResolvedValue(mockUpdated);

            // Act
            await ubahStatusReport(req as Request, res as Response);

            // Assert
            expect(CSReportService.updateReportStatus).toHaveBeenCalledWith('1', 'DIABAIKAN');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUpdated);
        });

        it('should return 400 for invalid status', async () => {
            // Arrange
            req.params = { id: '1' };
            req.body = { status: 'INVALID_STATUS' };

            // Act
            await ubahStatusReport(req as Request, res as Response);

            // Assert
            expect(CSReportService.updateReportStatus).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Status tidak valid' });
        });

        it('should return 400 when update fails', async () => {
            // Arrange
            req.params = { id: '999' };
            req.body = { status: 'DITERIMA' };
            const error = new Error('Report not found');
            (CSReportService.updateReportStatus as jest.Mock).mockRejectedValue(error);

            // Act
            await ubahStatusReport(req as Request, res as Response);

            // Assert
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Report not found' });
        });
    });
});