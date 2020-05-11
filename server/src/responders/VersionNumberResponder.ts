import type * as express from 'express';

import type { ExpressWrapper } from '../ExpressWrapper';

class VersionNumberResponder {
    public static getVersion(
        services: ExpressWrapper['services'],
        req: express.Request,
        res: express.Response
    ) {
        res.setHeader('Content-Type', 'application/json');
        res.json(services.VersionNumber.versionNumber);
    }
}

export { VersionNumberResponder };
