import { VersionNumberResponder } from './VersionNumberResponder';

import type * as express from 'express';

const mockServices = {
    VersionNumber: {
        versionNumber: 'jest'
    }
};

const mockRes = () => {
    return {
        setHeader: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
    };
};

describe('getVersion', () => {
    describe('local', () => {
        const res = mockRes();

        VersionNumberResponder.getVersion(
            mockServices,
            null,
            (<unknown>res) as express.Response
        );

        test('header', () => {
            expect(res.setHeader.mock.calls[0][0]).toBe('Content-Type');
            expect(res.setHeader.mock.calls[0][1]).toBe('application/json');
        });

        test('body', () => {
            expect(res.json.mock.calls[0][0]).toStrictEqual('jest');
        });
    });
});
