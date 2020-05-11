import * as axios from 'axios';
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
        res.set('Content-Type', 'application/json');

        return axios.default
            .post(
                typeof __JENKINS_TARGET === typeof '' && __JENKINS_TARGET !== ''
                    ? __JENKINS_TARGET
                    : 'https://jenkinsto.cc/i/to-json',
                req.body.toString('utf-8'),
                {
                    transformResponse: (res) => res
                }
            )
            .then((ret) => {
                res.status(200).end(ret.data);
            })
            .catch((error) => {
                JenkinsToCCIResponder.returnErrorMessage(req, res, error);
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
