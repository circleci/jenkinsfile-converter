import { VersionNumberResponder } from './VersionNumberResponder';

import type * as express from 'express';

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
            null,
            null,
            (<unknown>res) as express.Response
        );

        test('header', () => {
            expect(res.setHeader.mock.calls[0][0]).toBe('Content-Type');
            expect(res.setHeader.mock.calls[0][1]).toBe('application/json');
        });

        test('body', () => {
            expect(res.json.mock.calls[0][0]).toStrictEqual('local');
        });
    });

    describe('custom', () => {
        const res = mockRes();

        Object.defineProperty(global, '__BUILD_VERSION', { value: 'custom' });

        VersionNumberResponder.getVersion(
            null,
            null,
            (<unknown>res) as express.Response
        );

        test('header', () => {
            expect(res.setHeader.mock.calls[0][0]).toBe('Content-Type');
            expect(res.setHeader.mock.calls[0][1]).toBe('application/json');
        });

        test('body', () => {
            expect(res.json.mock.calls[0][0]).toStrictEqual('custom');
        });
    });
});
