const http = require('http');
const https = require('https');
const querystring = require('querystring');
const url = require('url');
const util = require('util');

const { map } = require('./mapping/mapper.js');

const jenkinsTarget = (typeof __JENKINS_TARGET === typeof '' && __JENKINS_TARGET !== '') ? __JENKINS_TARGET : 'https://jenkinsto.cc/i/to-json';

const groovyToJSONHTTPCB = (resolve, reject, res) => {
  const dataChunks = [];

  res.on('data', (data) => {
    dataChunks.push(data);
  });

  res.on('end', () => {
    const resBodyStr = Buffer.concat(dataChunks).toString();

    if (res.statusCode === 200) {
      resolve(resBodyStr);
    } else {
      reject(resBodyStr);
    }
  });

  res.on('error', (err) => {
    reject(err);
  });
};

const groovyToJSONRunner = (groovyStr, resolve, reject) => {
  try {
    const bodyData = querystring.stringify({ jenkinsfile: groovyStr });
    const req = (url.parse(jenkinsTarget).protocol === 'https:' ? https : http).request(
      jenkinsTarget,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': bodyData.length
        }
      },
      groovyToJSONHTTPCB.bind(null, resolve, reject)
    );

    req.write(bodyData);
    req.end();
  } catch (err) {
    reject(err);
  }
};

const groovyToJSONPromise = (groovyStr) => {
  return new Promise(groovyToJSONRunner.bind(null, groovyStr));
};

const formatErrorDetails = (err) => {
  return `  ${util.format(err).replace(/\n/g, '\n  ')}`;
};

// Main from here
const jenkinsToCCI = async (jenkinsfile) => {
  const jenkinsJSON = await groovyToJSONPromise(jenkinsfile.toString('utf-8')).catch((err) => {
    throw (new Error(`Error in Jenkins. Details:\n${formatErrorDetails(err)}`));
  });

  try {
    const jenkinsObj = JSON.parse(jenkinsJSON).data.json;
    const circleConfig = map(jenkinsObj);
    const configYml = circleConfig.toYAML();

    return configYml;
  } catch (err) {
    throw (new Error(`Error in mapping. Details:\n${formatErrorDetails(err)}`));
  }
};

module.exports = { jenkinsToCCI };
