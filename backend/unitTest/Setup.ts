import { jest } from '@jest/globals';

// Mock express Request and Response
export const mockRequest = () => {
    const req: any = {};
    req.body = {};
    req.params = {};
    req.query = {};
    req.user = {};
    return req;
};

export const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res;
};