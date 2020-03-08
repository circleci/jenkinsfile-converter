import { ConfigStanza } from './ConfigStanza.mjs';

/**
 * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L287
 */
class CircleWorkflowTrigger extends ConfigStanza {
    /**
     * @param {{ cron: string, filters: { branches: CircleBranchFilter } }} schedule 
     */
    constructor(schedule) {
        super();

        this.schedule = schedule;
    }
}

export { CircleWorkflowTrigger };
