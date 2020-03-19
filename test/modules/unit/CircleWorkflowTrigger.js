const assert = require('chai').assert;

const { CircleWorkflowTrigger } = require('../../../model/CircleWorkflowTrigger.js');

describe('CircleWorkflowTrigger', () => {
    let obj;

    before(() => {
        obj = new CircleWorkflowTrigger(null);
    });

    describe('constructor', () => {
        it('should have null schedule', () => {
            assert(obj.schedule === null);
        });
    });
});
