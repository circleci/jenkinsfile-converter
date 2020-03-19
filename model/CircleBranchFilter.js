/**
 * https://github.com/circleci/build-agent/blob/2c97bd8862211a39e02d450cc1e797d7d2b82df5/data/config.schema.json#L86
 */
class CircleBranchFilter {
  /**
   * @type {string | string[]}
   */
  only;

  /**
   * @type {string | string[]}
   */
  ignore;
}

module.exports = { CircleBranchFilter };
