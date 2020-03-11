const yaml = require('js-yaml');

/**
 * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L349
 */
class CircleConfig {
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
     * Hidden property for handling comments
     * @type {string[]}
     */
    comments;

    /**
     * @param {number} version 
     */
    constructor(version) {
        this.version = version;
        this.jobs = {};

        this.workflows = {
            version: 2
        };

        this.comments = [];

        Object.defineProperty(this, "comments", { enumerable: false });
        Object.defineProperty(this, "toJSON", { enumerable: false });
        Object.defineProperty(this, "toYAML", { enumerable: false });
    }

    toYAML() {
        let yamlString = yaml.safeDump(this, { skipInvalid: true });

        yamlString += `\n# ${this.comments.join('\n# ')}`;

        // For debugging - remove this
        console.log(yamlString);

        return yamlString;
    }
}

module.exports = { CircleConfig };
