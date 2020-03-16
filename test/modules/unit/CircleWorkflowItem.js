const expect = require('chai').expect;
const assert = require('chai').assert;

const { CircleWorkflowItem } = require('../../../model/CircleWorkflowItem.js');

describe('CircleWorkflowItem', () => {
    let obj;

    before(() => {
        obj = new CircleWorkflowItem();
    });

    describe('constructor', () => {
        it('should have an empty jobs', () => {
            expect(obj.jobs).to.be.a('array')
            assert(obj.jobs.length === 0);
        });
    });
});
