import type * as express from 'express';

import type { ExpressWrapper } from '../ExpressWrapper';

declare const __BUILD_VERSION: string;

class VersionNumberResponder {
    public static getVersion(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ) {
        res.setHeader('Content-Type', 'application/json');
        res.json(
            typeof __BUILD_VERSION === typeof '' ? __BUILD_VERSION : 'local'
        );
    }
}

export { VersionNumberResponder };
