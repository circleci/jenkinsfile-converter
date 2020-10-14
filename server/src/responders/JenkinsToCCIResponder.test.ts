import { JenkinsToCCIResponder } from './JenkinsToCCIResponder';

import { serviceMocks } from '../services/ServiceMocks';

import type * as express from 'express';

const reqBody = 'groovy';
const resBody = 'yaml or json';

const reqMock = {
    body: reqBody
};

const mockAxiosPost = jest.fn((url, data, options) => {
    return new Promise((resolve) =>
        resolve({ data: options.transformResponse(resBody) })
    );
});

const mockAxiosPostWithReject = jest.fn().mockRejectedValue(new Error());

const mockJenkinsToCCI = jest.fn().mockResolvedValue(resBody);
const mockJenkinsToCCIWithServerError = jest
    .fn()
    .mockRejectedValue(new Error('server error'));
const mockJenkinsToCCIWithClientError = jest.fn().mockRejectedValue(
    (() => {
        const ret: any = new Error('client error');

        ret.errorIn = 'client';
        ret.parserErrors = ['Upset'];

        return ret;
    })()
);
const mockJenkinsToCCIWithBrokenError = jest.fn().mockRejectedValue(void 0);

const mockRes = () => {
    return {
        status: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis()
    };
};

jest.mock('axios');
jest.mock('../ExpressWrapper');
jest.mock('../../assets/jfc-module.js');
jest.mock('../../assets/cli.html');

describe('webUI', () => {
    const req = reqMock;
    const res = mockRes();

    beforeAll(async () => {
        await JenkinsToCCIResponder.webUI(
            serviceMocks,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );
    });

    test('header', () => {
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.set.mock.calls[0][0]).toBe('Content-Type');
        expect(res.set.mock.calls[0][1]).toBe('text/html; charset=UTF-8');
    });

    test('body', async () => {
        expect(res.end.mock.calls[0][0]).toBe(require('../../assets/cli.html'));
    });
});

describe('convertJenkinsfileToConfigYml', () => {
    const req = reqMock;
    const res = mockRes();

    beforeAll(async () => {
        const jfcModule = require('../../assets/jfc-module.js');

        jfcModule.jenkinsToCCI.mockImplementationOnce(mockJenkinsToCCI);
        await JenkinsToCCIResponder.convertJenkinsfileToConfigYml(
            serviceMocks,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );

        jfcModule.jenkinsToCCI.mockImplementationOnce(
            mockJenkinsToCCIWithServerError
        );
        await JenkinsToCCIResponder.convertJenkinsfileToConfigYml(
            serviceMocks,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );

        jfcModule.jenkinsToCCI.mockImplementationOnce(
            mockJenkinsToCCIWithClientError
        );
        await JenkinsToCCIResponder.convertJenkinsfileToConfigYml(
            serviceMocks,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );

        jfcModule.jenkinsToCCI.mockImplementationOnce(
            mockJenkinsToCCIWithBrokenError
        );
        await JenkinsToCCIResponder.convertJenkinsfileToConfigYml(
            serviceMocks,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );
    });

    test('jenkinsToCCI', () => {
        expect(mockJenkinsToCCI.mock.calls[0][0]).toBe(reqBody);
    });

    test('header', () => {
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.set.mock.calls[0][0]).toBe('X-RID');
        expect(res.set.mock.calls[1][0]).toBe('Content-Type');
        expect(res.set.mock.calls[1][1]).toBe('text/x-yaml');
    });

    test('body', async () => {
        expect(res.end.mock.calls[0][0]).toBe(resBody);
    });

    test('server error', () => {
        expect(res.status.mock.calls[1][0]).toBe(500);
        expect(res.set.mock.calls[2][0]).toBe('X-RID');
        expect(res.set.mock.calls[3][0]).toBe('Content-Type');
        expect(res.set.mock.calls[3][1]).toBe('application/json');
        expect(JSON.parse(res.end.mock.calls[1][0]).message).toEqual(
            'server error'
        );
        expect(res.end).toHaveBeenCalled();
    });

    test('client error', () => {
        expect(res.status.mock.calls[2][0]).toBe(400);
        expect(JSON.parse(res.end.mock.calls[2][0]).message).toEqual(
            'client error'
        );
        expect(
            JSON.parse(res.end.mock.calls[2][0]).parserErrors
        ).toStrictEqual(['Upset']);
    });

    test('broken error', () => {
        expect(res.status.mock.calls[3][0]).toBe(500);
    });
});

describe('convertJenkinsfileToJSON', () => {
    const req = reqMock;
    const res = mockRes();
    const customJenkins = 'https://jenkins.example.com/';

    beforeAll(async () => {
        const axios = require('axios');

        axios.post.mockImplementationOnce(mockAxiosPost);
        axios.post.mockImplementationOnce(mockAxiosPost);
        axios.post.mockImplementationOnce(mockAxiosPostWithReject);

        await JenkinsToCCIResponder.convertJenkinsfileToJSON(
            serviceMocks,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );

        process.env.JFC_JENKINS_URL = 'https://jenkins.example.com/';

        await JenkinsToCCIResponder.convertJenkinsfileToJSON(
            serviceMocks,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );

        await JenkinsToCCIResponder.convertJenkinsfileToJSON(
            serviceMocks,
            (<unknown>req) as express.Request,
            (<unknown>res) as express.Response
        );
    });

    test('axios', () => {
        expect(mockAxiosPost.mock.calls[0][0]).toBe(
            'https://preview.jenkinsto.cc/i/to-json'
        );
        expect(mockAxiosPost.mock.calls[0][1]).toBe(reqBody);
        expect(mockAxiosPost.mock.calls[1][0]).toBe(customJenkins);
        expect(mockAxiosPost.mock.calls[1][1]).toBe(reqBody);
    });

    test('header', () => {
        expect(res.status.mock.calls[0][0]).toBe(200);
        expect(res.set.mock.calls[0][0]).toBe('Content-Type');
        expect(res.set.mock.calls[0][1]).toBe('application/json');
    });

    test('body', async () => {
        expect(res.end.mock.calls[0][0]).toBe(resBody);
    });

    test('error-handling', () => {
        expect(res.status.mock.calls[2][0]).toBe(500);
        expect(res.set.mock.calls[2][0]).toBe('Content-Type');
        expect(res.set.mock.calls[2][1]).toBe('application/json');
        expect(res.end).toHaveBeenCalled();
    });
});
