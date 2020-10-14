import * as axios from 'axios';
import * as fs from 'fs';
import * as util from 'util';
import * as uuid from 'uuid';

import * as jfcModule from '../../assets/jfc-module.js';

import type * as express from 'express';

import type { ExpressWrapper } from '../ExpressWrapper';
import type { AmplitudeClientService } from '../services/AmplitudeClientService.js';

/* istanbul ignore next */
require.extensions &&
    (require.extensions['.html'] = (module: NodeJS.Module, filename: string) =>
        (module.exports = fs.readFileSync(filename)));
const cliHTML = require('../../assets/cli.html');

class JenkinsToCCIResponder {
    public static webUI(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ): void {
        JenkinsToCCIResponder.fireUserRequestEvent(
            uuid.v4(),
            services.AmplitudeClient,
            req
        );

        // TODO: Redirect to Developer Hub?

        res.status(200)
            .set('Content-Type', 'text/html; charset=UTF-8')
            .end(cliHTML);
    }

    public static convertJenkinsfileToConfigYml(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const rid = uuid.v4();

        res.set('X-RID', rid);

        JenkinsToCCIResponder.fireUserRequestEvent(
            rid,
            services.AmplitudeClient,
            req
        );

        services.ConfigStorageClient.upload(
            `user-input-jenkinsfiles/${rid}`,
            req.body
        );

        return jfcModule
            .jenkinsToCCI(req.body, rid)
            .then((ret) => {
                JenkinsToCCIResponder.fire200Event(
                    rid,
                    services.AmplitudeClient,
                    req
                );

                services.ConfigStorageClient.upload(
                    `delivered-config-yml/${rid}`,
                    ret
                );

                res.status(200).set('Content-Type', 'text/x-yaml').end(ret); // TODO: Change to return JSON instead
            })
            .catch((error) => {
                JenkinsToCCIResponder.returnErrorMessage(
                    rid,
                    req,
                    res,
                    error,
                    services.VersionNumber.versionNumber,
                    services.AmplitudeClient
                );
            });
    }

    public static convertJenkinsfileToJSON(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ): Promise<void> {
        const rid = uuid.v4();

        JenkinsToCCIResponder.fireUserRequestEvent(
            rid,
            services.AmplitudeClient,
            req
        );

        return axios.default
            .post(
                process.env.JFC_JENKINS_URL
                    ? process.env.JFC_JENKINS_URL
                    : 'https://preview.jenkinsto.cc/i/to-json',
                req.body.toString('utf-8'),
                {
                    transformResponse: (res) => res
                }
            )
            .then((ret) => {
                JenkinsToCCIResponder.fire200Event(
                    rid,
                    services.AmplitudeClient,
                    req
                );

                res.status(200)
                    .set('Content-Type', 'application/json')
                    .end(ret.data);
            })
            .catch((error) => {
                JenkinsToCCIResponder.returnErrorMessage(
                    rid,
                    req,
                    res,
                    error,
                    services.VersionNumber.versionNumber,
                    services.AmplitudeClient
                );
            });
    }

    private static returnErrorMessage(
        rid: string,
        req: express.Request,
        res: express.Response,
        err: any,
        serverVersion: string,
        ampCli: AmplitudeClientService
    ): void {
        const bodyObj: { [key: string]: any } = {};
        const httpStatus: number = JenkinsToCCIResponder.httpErrorStatus(err);

        try {
            bodyObj.greeting =
                'Conversion failed. Please contact support with this entire error message.';
            bodyObj.at = new Date().toUTCString();
            bodyObj.serverVersion = serverVersion;
            bodyObj.calling = `${req.method} ${req.path}`;
            bodyObj.errorName = err && err.name ? err.name : '';
            bodyObj.message = err && err.message ? err.message : '';
            bodyObj.errorFormatted = util.format(err); // TODO: Send error details in a machine-readable format

            if (err.parserErrors) {
                bodyObj.parserErrors = err.parserErrors;
            }

            ampCli.logEvent({
                event_type: `jfc-conversion-failure`,
                event_properties: {
                    rid,
                    calling: `${req.method} ${req.path}`,
                    errorName: err.name,
                    parserErrors: bodyObj.parserErrors
                    // TODO: Consider submiting more anonymous information
                }
            });
        } catch (secondError) {
            ampCli.logEvent({
                event_type: 'jfc-irregular-error',
                event_properties: {
                    rid,
                    errorFormatted: util.format(secondError)
                }
            });
        } finally {
            res.status(httpStatus)
                .set('Content-Type', 'application/json')
                .end(JSON.stringify(bodyObj, null, 4));
        }
    }

    private static httpErrorStatus(err: any): number {
        try {
            return err.errorIn === 'client' ? 400 : 500;
        } catch (err) {
            return 500;
        }
    }

    private static fireUserRequestEvent(
        rid: string,
        ampCli: AmplitudeClientService,
        req: express.Request
    ): void {
        ampCli.logEvent({
            event_type: 'jfc-user-request',
            event_properties: {
                rid,
                calling: `${req.method} ${req.path}`
            }
        });
    }

    private static fire200Event(
        rid: string,
        ampCli: AmplitudeClientService,
        req: express.Request
    ): void {
        ampCli.logEvent({
            event_type: 'jfc-responding',
            event_properties: {
                rid,
                calling: `${req.method} ${req.path}`,
                status: 200
            }
        });
    }
}

export { JenkinsToCCIResponder };
