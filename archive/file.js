const fs = require('fs');
const { checkDirective, isBalanced, removeComments } = require('./jfParse.js');

const openFile = (path) => fs.readFileSync(path, { encoding: 'utf8' });

// Check that our parser will actually be able to interact with the Jenkinsfile
// TODO: Using the Jenkins linter would be really nice here. This requires a standing Jenkins install unfortunately
// For now we will just verify this is a declarative pipeline by looking for the `pipeline` block
const verifyValid = (j) => {
  for (let l of j.split('\n')) {
    // running removeComments on j causes everything after the first comment to be removed so this is my workaround
    // TODO: fix removeComments to work on the entire config
    l = removeComments(l);
    if (l.trim()) {
      // TODO: fix this logic, very naive implementation
      if (checkDirective(l, 'pipeline')) {
        return isBalanced(j);
      }
    }
  }
  console.log('Invalid Jenkinsfile');
  return false;
};

module.exports = { openFile, verifyValid };
