const assert = require('chai').assert;

const { CircleJobDockerContainer } = require('../../../model/CircleJobDockerContainer.js');

describe('CircleJobDockerContainer', () => {
    let imageName, obj;

    before(() => {
        imageName = 'example';
        obj = new CircleJobDockerContainer(imageName);
    });

    describe('constructor', () => {
        it('should have an image name', () => {
            assert(obj.image === imageName);
        });
    });
});
