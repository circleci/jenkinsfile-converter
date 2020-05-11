const axios = require('axios');
const querystring = require('querystring');
const util = require('util');

const { map } = require('./mapping/mapper.js');

const jenkinsTarget = (typeof __JENKINS_TARGET === typeof '' && __JENKINS_TARGET !== '') ? __JENKINS_TARGET : 'https://jenkinsto.cc/i/to-json';

const formatErrorDetails = (err) => {
  return `  ${util.format(err).replace(/\n/g, '\n  ')}`;
};

// Main from here
const jenkinsToCCI = async (jenkinsfile) => {
  const fromJenkins = (await axios.post(jenkinsTarget, querystring.stringify({ jenkinsfile: jenkinsfile.toString('utf-8') })).catch((err) => {
    throw (new Error(`Error in parser. Details:\n${formatErrorDetails(err)}`));
  })).data;
  let isFinal = false;

  try {
    if (fromJenkins.data.result === 'failure') {
      let errorMsgArr = ['Failed to parse your Jenkinsfile. It happens especially if your Jenkinsfile is relying on unsupported plugins - in such cases, removing stanzas mentioned below will suppress the error.\nHere are error messages from the parser:'];

      fromJenkins.data.errors.forEach((errorObj, index) => {
        errorMsgArr.push(`${index + 1}. ${errorObj.error}`);
      });

      isFinal = true;
      throw new Error(`${errorMsgArr.join('\n\n')}\n`);
    }
  } catch (err) {
    throw isFinal ? err : new Error(`Error in verification of response from parser. Details:\n${formatErrorDetails(err)}`)
  }

  try {
    const jenkinsObj = fromJenkins.data.json;
    const circleConfig = map(jenkinsObj);
    const configYml = circleConfig.toYAML();

    isFinal = true;
    return configYml;
  } catch (err) {
    throw new Error(`Error in mapping. Details:\n${formatErrorDetails(err)}`);
  }
};

module.exports = { jenkinsToCCI };
