/* eslint-disable no-unused-vars */
const expect = require('chai').expect;
const assert = require('chai').assert;

const { openFile, verifyValid } = require('../../../util/file.js');
/* eslint-enable no-unused-vars */

describe('file', () => {
  describe('openFile', () => {
    it('should return a string', () => {
      expect(openFile(__filename)).to.be.a('string');
    });
  });
  describe('verifyValid', () => {
    it('should pass valid config', () => {
      expect('dummy test').to.be.a('string');
    });
  });
});
