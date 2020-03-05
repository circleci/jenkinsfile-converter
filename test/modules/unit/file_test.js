const expect = require('chai').expect;
const assert = require('chai').assert;

const { Workflow } = require('../../../model/workflow.js');
const { comment, 
  padding, 
  multilineComment, 
  errorComment, 
  generateHeader } = require('../../../util/configGen.js');

describe('configGen', () => {
  
  describe('#comment', () => {
    it('Creates a single line comment from a given string', () => {
      expect(comment('This is a test comment!')).to.equal('# This is a test comment!\n');
    });
  });

  describe('#padding', () => {
    it('Outputs an equal number of spaces as the given parameter', () => {
      expect(padding('a', 12)).to.equal('            a');
    });
  });

  describe('#multilineComment', () => {
    it('needs tests', () => {
      expect('foo'
        ).to.be.a('string');
    });
  });

  describe('#errorComment', () => {
    it('needs tests', () => {
      expect('foo'
        ).to.be.a('string');
    });
  });

  describe('#generateHeader', () => {
    it('needs tests', () => {
      expect('foo'
        ).to.be.a('string');
    });
  });

});
