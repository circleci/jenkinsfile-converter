// This is a proof of concept of converting declarative Jenkinsfiles to CircleCI 2.0 config

// The intention of this script in its current state is not to be the interface that a user will interact with, but just a POC of the conversion from Jenkinsfiles to CCI config.

const fs = require('fs');
const path = require('path');

const { openFile, verifyValid } = require('./util/file.js');
const { parseJenkinsfile } = require('./util/jenkins.js');

// TODO: Groovy library to interact with Jenkinsfiles?
// TODO: YAML Library to handle/validate output?

// TODO: Pair Jenkinsfiles syntax key with CCI syntax key

{
  const inputPath = process.argv[2];
  const outputPath = process.argv[3] || 'config.yml';
  const jenkinsfile = openFile(inputPath);

  if (!verifyValid(jenkinsfile)) {
    //TODO: return error and change exit
    console.error(
      'Invalid configuration. This tool only supports Jenkinsfiles using declarative pipelines.'
    );
  }

  {
    const circleConfig = parseJenkinsfile(jenkinsfile);
    let circleYAML = circleConfig.toYAML();

    // Hacking - Advisory for executors is inserted as 
    // We remove the property definition here and put the advisory text as comments.
    circleYAML = circleYAML.replace(/^\s*advisory_for_users: \|-\s*\n\n/m, '');

    fs.writeFileSync(path.join(__dirname, outputPath), circleYAML);
    console.log('file saved!');
  }
}
