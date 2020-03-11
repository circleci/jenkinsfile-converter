// This is a proof of concept of converting declarative Jenkinsfiles to CircleCI 2.0 config

// The intention of this script in its current state is not to be the interface that a user will interact with, but just a POC of the conversion from Jenkinsfiles to CCI config.

const fs = require('fs');
const path = require('path');

const cfg = require('./util/configGen.js');
const { createConfig } = require('./util/circleci.js');
const { openFile, verifyValid } = require('./util/file.js');
const { parseJenkinsfile } = require('./util/jenkins.js');

// TODO: Groovy library to interact with Jenkinsfiles?
// TODO: YAML Library to handle/validate output?

// TODO: Pair Jenkinsfiles syntax key with CCI syntax key

{
  const config = [cfg.generateHeader(), 'version: 2.1'];
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
    const circleConfig = parseJenkinsfile(jenkinsfile)
    console.log(circleConfig);
    const circleYAML = circleConfig.toYAML();
    console.log(circleYAML)

    fs.writeFileSync(path.join(__dirname, outputPath), circleYAML);
    console.log('file saved!');
  }
}
