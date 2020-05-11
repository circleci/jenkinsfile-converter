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
    throw (new Error(`Error in Jenkins. Details:\n${formatErrorDetails(err)}`));
  })).data;

  try {
    const jenkinsObj = fromJenkins.data.json;
    const circleConfig = map(jenkinsObj);
    const configYml = circleConfig.toYAML();

    return configYml;
  } catch (err) {
    throw (new Error(`Error in mapping. Details:\n${formatErrorDetails(err)}`));
  }
};

module.exports = { jenkinsToCCI };
