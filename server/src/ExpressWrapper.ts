import * as bodyParser from 'body-parser';
import * as express from 'express';

import type * as http from 'http';

declare const __BUILD_VERSION: string;

class ExpressWrapper {
    private readonly listenAddrs = ['::'];
    private readonly listenPort = 28080;

    public services = {};

    private app: express.Express = express();
    private httpServers: http.Server[] = [];

    constructor() {
        this.app.use(bodyParser.raw({ type: '*/*' }));
        this.app.use((req, res, next) =>
            this.setVersionInHeader(req, res, next)
        );
    }

    public startListening(): Promise<ExpressWrapper['httpServers']> {
        return new Promise<ExpressWrapper['httpServers']>(
            this.startListeningPromiseWorker.bind(this)
        );
    }

    private async startListeningPromiseWorker(
        masterResolve: (w: ExpressWrapper['httpServers']) => void,
        masterReject: (e: Error) => void
    ) {
        try {
            const promises = this.listenAddrs.map((listenAddr) => {
                return new Promise<http.Server | Error>((resolve, reject) => {
                    try {
                        let server: http.Server = null;

                        server = this.app.listen(
                            this.listenPort,
                            listenAddr,
                            () => {
                                console.log(
                                    `Listening ${this.listenPort} of ${listenAddr}`
                                );
                                resolve(server);
                            }
                        );

                        this.httpServers.push(server);
                    } catch (err) {
                        reject(err);
                    }
                });
            });

            for (const promise of promises) {
                await promise;
            }

            masterResolve(this.httpServers);
        } catch (err) {
            masterReject(err);
        }
    }

    private setVersionInHeader(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {
        res.setHeader(
            'X-App-Version',
            typeof __BUILD_VERSION === typeof '' && __BUILD_VERSION
                ? __BUILD_VERSION
                : 'local'
        );
        next();
    }

    public armEndpoint(
        methodRaw: string,
        path: string,
        boundResponder: (
            services: ExpressWrapper['services'],
            req: express.Request,
            res: express.Response
        ) => void
    ) {
        const method = methodRaw.toLowerCase();

        switch (method) {
            case 'checkout':
            case 'copy':
            case 'delete':
            case 'get':
            case 'head':
            case 'lock':
            case 'merge':
            case 'mkactivity':
            case 'mkcol':
            case 'move':
            case 'm-search':
            case 'notify':
            case 'options':
            case 'patch':
            case 'post':
            case 'purge':
            case 'put':
            case 'report':
            case 'search':
            case 'subscribe':
            case 'trace':
            case 'unlock':
            case 'unsubscribe':
                this.app[method](
                    path,
                    boundResponder.bind(null, this.services)
                );
                break;
        }
    }
}

export { ExpressWrapper };
