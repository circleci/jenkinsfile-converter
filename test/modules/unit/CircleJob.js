const expect = require('chai').expect;
const assert = require('chai').assert;

const { CircleJob } = require('../../../model/CircleJob.js');

describe('CircleJob', () => {
  let obj;

  before(() => {
    obj = new CircleJob();
  });

  describe('constructor', () => {
    it('should have an empty steps', () => {
      expect(obj.steps).to.be.a('array');
      assert(obj.steps.length === 0);
    });
  });
});
