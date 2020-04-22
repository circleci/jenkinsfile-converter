const fs = require('fs');
const https = require('https');
const querystring = require('querystring');

const { map } = require('./mapping/mapper.js');

{
  const groovyToJSONHTTPSCB = (resolve, reject, res) => {
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
      const req = https.request(
        'https://jenkinsto.cc/i',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': bodyData.length
          }
        },
        groovyToJSONHTTPSCB.bind(null, resolve, reject)
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

  // Main from here
  (async () => {
    // TODO: Avoid nesting try-catch
    try {
      const inputPath = process.argv[2];
      const jenkinsJSON = await groovyToJSONPromise(fs.readFileSync(inputPath, 'utf8'));

      try {
        const jenkinsObj = JSON.parse(jenkinsJSON).data.json;
        const circleConfig = map(jenkinsObj);

        console.log(circleConfig.toYAML());
      } catch (err) {
        console.error(err);
        console.error('Error in conversion');
      }
    } catch (err) {
      console.error(err);
      console.error('Error in Jenkins');
    }
  })();
}
