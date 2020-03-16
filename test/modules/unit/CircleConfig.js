const expect = require('chai').expect;
const assert = require('chai').assert;

const { CircleConfig } = require('../../../model/CircleConfig.js');

describe('CircleConfig', () => {
    const obj = new CircleConfig(2.1);
    const commentString = 'My comments!';

    obj.comments.push(commentString);

    describe('constructor', () => {
        it('should have mark version as 2.1', () => {
            assert(obj.version === 2.1);
        });
    });

    describe('toYAML', () => {
        const yaml = obj.toYAML();

        it('should rerutn string', () => {
            expect(yaml).to.be.a('string');
        });

        it('should not include comment property', () => {
            assert(/^comments/.test(yaml) === false);
        });

        it('should include comment portion as comments instead', () => {
            assert(new RegExp(`^# ${commentString}`, 'm').test(yaml) === true);
        })
    });
});
