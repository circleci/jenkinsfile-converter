import { ConfigStanza } from './ConfigStanza.mjs';

/**
 * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L349
 */
class CircleConfig extends ConfigStanza {
    /**
     * @type {number}
     */
    version;

    /**
     * @type {{ [shorthand: string]: string }}
     */
    orbs;

    /**
     * @type {{
     *  [name: string]: {
     *      steps: (string | { [stepCommand: string]: string | { [stepParam: string]: any } })[],
     *      parameters?: {
     *          [paramName: string]: {
     *              description?: string,
     *              type: string,
     *              default?: string
     *          }
     *      }[]
     *      description?: string
     *  }
     * }}
     */
    commands;

    /**
     * @type { [paramName: string]: {
     *  description?: string,
     *  type: string,
     *  default: string
     * }}
     */
    parameters;

    /**
     * @type { [executorName: string]: {
     *  environment?: { [key: string]: string },
     *  working_directory?: string,
     *  shell?: string,
     *  resource_class?: string,
     *  docker?: CircleJobDockerContainer[],
     *  machine?: { image: string, docker_layer_caching?: boolean },
     *  macos?: { xcode: string }
     * }}
     */
    executors;

    /**
     * @type {{ [key: string]: CircleJob }}
     */
    jobs;

    /**
     * @type {{ version: number, [key: string]: CircleWorkflowItem}
     */
    workflows;

    /**
     * @param {number} version 
     * @param {{ [key: string]: CircleJob }} jobs 
     */
    constructor(version, jobs) {
        super();

        this.version = version;
        this.jobs = jobs;

        this.workflows = {
            version: 2
        };
    }

    toJSON() {
        // TODO: Delete empty properties for valid YAML generation?
        return JSON.stringify(this);
    }

    toYAML() {
        // TODO: Convert to YAML
        return this.toJSON();
    }
}

export { CircleConfig };
