import { JenkinsToCCIResponder } from './JenkinsToCCIResponder';

import type * as express from 'express';

const reqBody = 'groovy';
const resBody = 'response: yaml';

const mockReq = {
    body: reqBody
};

const mockJenkinsToCCI = jest.fn().mockResolvedValue(resBody);

const mockRes = () => {
    return {
        setHeader: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis()
    };
};

jest.mock('../../assets/jfc-module.js');

describe('convertJenkinsfileToConfigYml', () => {
    const req = mockReq;
    const res = mockRes();

    beforeAll(async () => {
        const jfcModule = require('../../assets/jfc-module.js');

        jfcModule.jenkinsToCCI.mockImplementation(mockJenkinsToCCI);

        await JenkinsToCCIResponder.convertJenkinsfileToConfigYml(
            null,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );
    });

    test('jenkinsToCCI', () => {
        expect(mockJenkinsToCCI.mock.calls[0][0]).toBe(reqBody);
    });

    test('header', () => {
        expect(res.setHeader.mock.calls[0][0]).toBe('Content-Type');
        expect(res.setHeader.mock.calls[0][1]).toBe('text/yaml');
    });

    test('body', async () => {
        expect(res.end.mock.calls[0][0]).toBe(resBody);
    });

    // TODO: Test toJSON wich mocking https library
});
