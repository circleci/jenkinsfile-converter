/**
 * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L315
 */
class CircleWorkflowJobCondition {
  /**
   * @type {string[]}
   */
  requires;

  /**
   * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L325
   * @type {{ branches: CircleBranchFilter, tags: CircleBranchFilter }}
   */
  filters;

  /**
   * @type {string}
   */
  context;

  /**
   * @type {string}
   */
  type;
}

module.exports = { CircleWorkflowJobCondition };
