import * as http from 'http';
import * as https from 'https';
import * as url from 'url';

import * as jfcModule from '../../assets/jfc-module.js';

import type * as express from 'express';

import type { ExpressWrapper } from '../ExpressWrapper';

declare const __JENKINS_TARGET: string;

class JenkinsToCCIResponder {
    private static readonly jenkinsTarget =
        typeof __JENKINS_TARGET === typeof '' && __JENKINS_TARGET !== ''
            ? __JENKINS_TARGET
            : 'https://jenkinsto.cc/i';

    public static async convertJenkinsfileToConfigYml(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ) {
        res.setHeader('Content-Type', 'text/x-yaml');
        res.end(
            await jfcModule
                .jenkinsToCCI(req.body.toString('utf-8'))
                .catch((err) => console.error(err))
        );
    }

    public static async convertJenkinsfileToJSON(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ) {
        res.setHeader('Content-Type', 'application/json');
        res.end(
            await JenkinsToCCIResponder.groovyToJSONPromise(
                req.body
            ).catch((err) => console.error(err))
        );
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
            const req = (url.parse(JenkinsToCCIResponder.jenkinsTarget)
                .protocol === 'https:'
                ? https
                : http
            ).request(
                JenkinsToCCIResponder.jenkinsTarget,
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
}

export { JenkinsToCCIResponder };
