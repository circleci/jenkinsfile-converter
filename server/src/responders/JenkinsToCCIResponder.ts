import * as jfcModule from '../../assets/jfc-module.js';
import * as querystring from 'querystring';

import type * as express from 'express';
import type { Query } from 'express-serve-static-core';

import type { ExpressWrapper } from '../ExpressWrapper';

type QueryValue = string | Query | (string | Query)[];

class JenkinsToCCIResponder {
    public static async convertJenkinsfileToConfigYml(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ) {
        res.setHeader('Content-Type', 'text/yaml');
        res.end(await jfcModule.jenkinsToCCI(querystring.unescape(req.body)));
    }
}

export { JenkinsToCCIResponder };
