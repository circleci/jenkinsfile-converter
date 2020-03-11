/**
 * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L5
 */
class CircleJob {
    /**
     * Note: Respect
     * https://circleci.com/docs/2.0/configuration-reference/#job_name
     * over
     * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L98
     * @type {{ [key: string]: string }}
     */
    environment;

    /**
     * @type {number}
     */
    parallelism;

    /**
     * @type {string}
     */
    working_directory;

    /**
     * Note: Preferring
     * https://circleci.com/docs/2.0/configuration-reference/#job_name
     * over
     * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L18
     * @type {string}
     */
    shell;

    /**
     * @type {(string | { [stepCommand: string]: string | { [stepParam: string]: any } } | { type : string })[]}
     */
    steps;

    /**
     * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L128
     * @type {{ xcode: string | number }}
     */
    macos;

    /**
     * @type {boolean | { enabled?: boolean, image: string, docker_layer_caching?: boolean }}
     */
    machine;

    /**
     * @type {CircleJobDockerContainer[]}
     */
    docker;

    /**
     * @type {CircleBranchFilter}
     */
    branches;

    /**
     * @type {string}
     */
    resource_class;

    constructor() {
        this.steps = [];
    }
}

module.exports = { CircleJob };
