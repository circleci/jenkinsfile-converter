import { ConfigStanza } from './ConfigStanza.mjs'

/**
 * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L266
 */
class CircleWorkflowItem extends ConfigStanza {
    /**
     * @type {(string | { [jobName: string]: CircleWorkflowJobCondition })[]}
     */
    jobs;

    /**
     * @type {CircleWorkflowTrigger[]}
     */
    triggers;

    constructor() {
        super();

        this.jobs = [];
    }
}

export { CircleWorkflowItem };
