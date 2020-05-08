import { mainPromise } from './main';

import * as http from 'http';

const promiseGet = (url: string, options = {}) => {
    return new Promise(
        (
            resolve: (v: {
                httpRes: http.IncomingMessage;
                data: Buffer;
            }) => void
        ) => {
            http.get(url, options, (res) => {
                const chunks: Buffer[] = [];

                res.on('data', (data) => {
                    chunks.push(data);
                });

                res.on('end', () => {
                    resolve({
                        httpRes: res,
                        data: Buffer.concat(chunks)
                    });
                });
            });
        }
    );
};

describe('API endpoint checks', () => {
    beforeAll(async () => {
        await mainPromise;
    });

    test('GET /version', async () => {
        const { httpRes, data } = await promiseGet('http://localhost:28080/');

        expect(httpRes.headers['x-app-version']).toBe('local');
        expect(JSON.parse(data.toString())).toStrictEqual('local');
    });

    afterAll(async () => {
        (await mainPromise).forEach((server) => {
            server.close();
        });
    });
});
