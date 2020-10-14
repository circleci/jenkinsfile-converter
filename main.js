const axios = require('axios');
const querystring = require('querystring');

const { map } = require('./mapping/mapper.js');
const { UpperStreamError, ParseFailure, MapperError } = require('./errors.js');

const jenkinsTarget = process.env.JFC_JENKINS_URL
  ? process.env.JFC_JENKINS_URL
  : 'https://preview.jenkinsto.cc/i/to-json';

// Main from here
const jenkinsToCCI = async (jenkinsfile, rid = '') => {
  const fromJenkins = (
    await axios
      .post(jenkinsTarget, querystring.stringify({ jenkinsfile: jenkinsfile.toString('utf-8') }))
      .catch((err) => {
        throw new UpperStreamError(rid, 'Upper stream infrastructural error.', err);
      })
  ).data;
  let isFinal = false;

  try {
    if (fromJenkins.data.result === 'failure') {
      const errorMsgArr = [
        'Failed to parse your Jenkinsfile. It happens especially if your Jenkinsfile is relying on unsupported plugins - in such cases, removing stanzas mentioned below will suppress the error.\nHere are error messages from the parser:'
      ];
      const errorQueue = fromJenkins.data.errors.slice();
      const parserErrors = [];

      let errCtr = 0;

      while (errorQueue.length > 0) {
        const errorObj = errorQueue.shift();

        if (Array.isArray(errorObj.error)) {
          for (let iter = errorObj.error.length - 1; iter >= 0; iter -= 1) {
            errorQueue.unshift(errorObj.error[iter]);
          }
        } else {
          errorMsgArr.push(`${++errCtr}. ${errorObj.error ? errorObj.error : errorObj}`);
          parserErrors.push(errorObj.error ? errorObj.error : errorObj);
        }
      }

      isFinal = true;
      throw new ParseFailure(rid, `${errorMsgArr.join('\n\n')}\n`, parserErrors, jenkinsfile);
    }

    if (!fromJenkins.data.json) {
      isFinal = true;
      throw new UpperStreamError(
        rid,
        'Uppser stream returned unconsistent reponse without valid body.',
        void 0,
        fromJenkins
      );
    }
  } catch (err) {
    throw isFinal
      ? err
      : new UpperStreamError(rid, `Upper stream returned broken response.`, err, fromJenkins);
  }

  try {
    const jenkinsObj = fromJenkins.data.json;
    const circleConfig = map(jenkinsObj);
    const configYml = circleConfig.toYAML();

    isFinal = true;
    // TODO: Metrics submission
    return configYml;
  } catch (err) {
    throw new MapperError(rid, `Error in mapping.`, err, fromJenkins.data.json);
  }
};

module.exports = { jenkinsToCCI };
