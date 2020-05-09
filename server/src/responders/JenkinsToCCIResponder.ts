import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import * as util from 'util';

import * as jfcModule from '../../assets/jfc-module.js';

import type * as express from 'express';

import type { ExpressWrapper } from '../ExpressWrapper';

declare const __JENKINS_TARGET: string;

class JenkinsToCCIResponder {
    public static convertJenkinsfileToConfigYml(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        return jfcModule
            .jenkinsToCCI(req.body)
            .then((ret) => {
                res.status(200).set('Content-Type', 'text/x-yaml').end(ret);
            })
            .catch((error) => {
                JenkinsToCCIResponder.returnErrorMessage(req, res, error);
            });
    }

    public static convertJenkinsfileToJSON(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        res.setHeader('Content-Type', 'application/json');

        return JenkinsToCCIResponder.groovyToJSONPromise(req.body)
            .then((ret) => {
                res.status(200).end(ret);
            })
            .catch((error) => {
                JenkinsToCCIResponder.returnErrorMessage(req, res, error);
            });
    }

    private static groovyToJSONPromise(bodyData: Buffer): Promise<string> {
        return new Promise(
            JenkinsToCCIResponder.groovyToJSONRunner.bind(
                JenkinsToCCIResponder,
                bodyData
            )
        );
    }

    private static groovyToJSONRunner(
        bodyData: Buffer,
        resolve: (res: string) => void,
        reject: (err: Error) => void
    ): void {
        try {
            const jenkinsTarget =
                typeof __JENKINS_TARGET === typeof '' && __JENKINS_TARGET !== ''
                    ? __JENKINS_TARGET
                    : 'https://jenkinsto.cc/i/to-json';
            const req = (url.parse(jenkinsTarget).protocol === 'https:'
                ? https
                : http
            ).request(
                jenkinsTarget,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': bodyData.length
                    }
                },
                JenkinsToCCIResponder.groovyToJSONCB.bind(this, resolve, reject)
            );

            req.write(bodyData);
            req.end();

            throw null;
        } catch (err) {
            reject(err);
        }
    }

    private static groovyToJSONCB(
        resolve: (res: string) => void,
        reject: (err: Error | string) => void,
        res: express.Response
    ): void {
        const dataChunks = [];

        res.on('data', (data) => {
            dataChunks.push(data);
        });

        res.on('end', () => {
            const resBodyStr = Buffer.concat(dataChunks).toString();

            if (res.statusCode === 200) {
                resolve(resBodyStr);
            } else {
                reject(resBodyStr);
            }
        });

        res.on('error', (err) => {
            reject(err);
        });
    }

    private static returnErrorMessage(
        req: express.Request,
        res: express.Response,
        err: any
    ): void {
        res.status(500)
            .set('Content-Type', 'application/json')
            .json({
                message:
                    'Conversion failed. Please contact support with this message.',
                error: util.format(err),
                request: {
                    method: req.method,
                    path: req.path,
                    body: req.body.toString('utf-8')
                }
            });
    }
}

export { JenkinsToCCIResponder };
