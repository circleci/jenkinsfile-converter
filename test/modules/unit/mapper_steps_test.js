const expect = require('chai').expect;

/* eslint-disable no-unused-vars */
const { directiveToCommand, fnPerVerb } = require('../../../mapping/mapper_steps.js');
/* eslint-enable no-unused-vars */

describe('jenkins', () => {
  describe('#directiveToCommand', () => {
    it('handles sh', () => {
      const tester = {
        name: 'sh',
        arguments: [
          {
            key: 'script',
            value: {
              isLiteral: true,
              value: 'mvn sonar:sonar -Dsonar.login=$SONAR_PSW'
            }
          }
        ]
      };
      let result = directiveToCommand(tester);
      expect(result).to.have.nested.property(
        'run.command',
        `mvn sonar:sonar -Dsonar.login=$SONAR_PSW`
      );
    });
    it('handles echo', () => {
      const tester = {
        name: 'echo',
        arguments: [
          {
            key: 'message',
            value: {
              isLiteral: true,
              value: 'Run integration tests here...'
            }
          }
        ]
      };
      let result = directiveToCommand(tester);
      expect(result).to.have.nested.property('run.command', `echo "Run integration tests here..."`);
    });
    it('handles catchError', () => {
      // const tester = {
      //   "name": "catchError",
      //   "arguments": [],
      //   "children": [
      //     {
      //       "name": "error",
      //       "arguments": [
      //         {
      //           "key": "message",
      //           "value": {
      //             "isLiteral": true,
      //             "value": "Force error"
      //           }
      //         }
      //       ]
      //     }
      //   ]
      // };
      // let result = directiveToCommand(tester);
      // TODO: add support for catchError
      // expect(result).to.have.property(`run`, `sleep 30`);
    });
    it('handles dir', () => {
      const tester = {
        name: 'dir',
        arguments: {
          isLiteral: true,
          value: 'combined'
        },
        children: [
          {
            name: 'sh',
            arguments: [
              {
                key: 'script',
                value: {
                  isLiteral: true,
                  value: 'echo $FOO > foo.txt'
                }
              }
            ]
          },
          {
            name: 'echo',
            arguments: [
              {
                key: 'message',
                value: {
                  isLiteral: true,
                  value: 'tester'
                }
              }
            ]
          }
        ]
      };
      let result = directiveToCommand(tester);
      expect(result[0]).to.have.nested.property('run.command', `echo $FOO > foo.txt`);
      expect(result[0]).to.have.nested.property('run.working_directory', `combined`);
      expect(result[1]).to.have.nested.property('run.command', `echo "tester"`);
      expect(result[1]).to.have.nested.property('run.working_directory', `combined`);
    });
  });
});
