/**
 * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L287
 */
class CircleWorkflowTrigger {
  /**
   * @param {{ cron: string, filters: { branches: CircleBranchFilter } }} schedule
   */
  constructor(schedule) {
    this.schedule = schedule;
  }
}

module.exports = { CircleWorkflowTrigger };
