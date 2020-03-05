const assert = require('chai').assert;
const expect = require('chai').expect;

const { Workflow } = require('../../../model/workflow.js');
const { applyCommentDescription, writeComments } = require('../../../util/configComments.js');

const commentStub = {
  "turtle": {
    "reason": " will win the race eventually.",
    "link": "https://hamsterdance.com"
  },
  "rabbit": {
    "reason": " perhaps should've paced himself.",
    "link": "https://beesbeesbees.com"
  }
}

describe('Comments', () => {
  
  const singleLineConfigTest = applyCommentDescription(
    'turtle', ["here-is-some-config"], commentStub);
  const multipleLineConfigTest = applyCommentDescription(
    'rabbit', ["here is some", "multiline", "config"], commentStub);
  const invalidConfigTest = applyCommentDescription(
    'fox', ["is not a valid comment keyword"], commentStub);

  describe('#applyCommentDescription', () => {
    it('returns the related reason for a given keyword', () => {
      expect(singleLineConfigTest
        ).to.have.string('will win the race eventually');
    });
    it('returns the related link for a given keyword', () => {
      expect(singleLineConfigTest
        ).to.have.string('https://hamsterdance.com');
    });
    it('handles valid multiple config lines', () => {
      expect(multipleLineConfigTest
        ).to.have.string('here is some');
      expect(multipleLineConfigTest
        ).to.have.string('multiline');
      expect(multipleLineConfigTest
        ).to.have.string('config');
    });
    it('handles invalid keywords gracefully', () => {
      expect(invalidConfigTest).to.be.a('string');
    });
  });

  let workflow = new Workflow();

  describe('#writeComments', () => {
    it('handles configs with no comments', () => {
      expect(writeComments(workflow)
        ).to.be.a('string');
    });
    it('handles configs with multiple lines', () => {
      workflow.comments.push('here', 'are', 'multiple', 'lines')
      expect(writeComments(workflow)
        ).to.be.a('string');
    });
  });
});
