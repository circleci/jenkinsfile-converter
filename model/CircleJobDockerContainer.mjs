import { ConfigStanza } from './ConfigStanza.mjs'

/**
 * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L166
 */
class CircleJobDockerContainer extends ConfigStanza {
    /**
     * @type {string}
     */
    image;

    /**
     * @type {string}
     */
    name;

    /**
     * @type {string | string[]}
     */
    entrypoint;

    /**
     * @type {string | string[]}
     */
    command;

    /**
     * @type {string}
     */
    user;

    /**
     * Note: Respect
     * https://circleci.com/docs/2.0/configuration-reference/#job_name
     * over
     * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L98
     * @type {{ [key: string]: string }}
     */
    environment;

    environment;

    /**
     * @type {{ aws_access_key_id: string, aws_secret_access_key: string }}
     */
    aws_auth;

    /**
     * @type {{ username: string, password: string }}
     */
    auth;

    constructor(image) {
        super();

        this.image = image;
    }
}

export { CircleJobDockerContainer };
