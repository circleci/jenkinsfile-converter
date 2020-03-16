const expect = require('chai').expect;
const assert = require('chai').assert;

const { CircleConfig } = require('../../../model/CircleConfig.js');

describe('CircleConfig', () => {
    let obj, commentString;

    before(() => {
        obj = new CircleConfig(2.1);
        commentString = 'My comments!';
    });

    describe('constructor', () => {
        it('should have mark version as 2.1', () => {
            assert(obj.version === 2.1);
        });

        it('should have an empty job list', () => {
            expect(obj.jobs).to.be.a('object');
            assert(Object.getOwnPropertyNames(obj.jobs).length === 0);
        });

        it('should have an initialized workflows stanza', () => {
            expect(obj.workflows).to.be.a('object');
            assert(obj.workflows.version === 2);
            assert(Object.getOwnPropertyNames(obj.workflows).length === 1);
        });

        it('should have an empty comments', () => {
            expect(obj.comments).to.be.a('array');
            assert(obj.comments.length === 0);
        });
    });

    describe('toYAML', () => {
        let yaml = '';

        before(() => {
            obj.comments.push(commentString);
            yaml = obj.toYAML();
        });

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
