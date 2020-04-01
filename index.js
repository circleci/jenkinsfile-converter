const fs = require('fs');
const request = require('request');
const openFile = (path) => fs.readFileSync(path, { encoding: 'utf8' });

const inputPath = process.argv[2];
const jenkinsin = openFile(inputPath);

var user = process.env.JENKINS_USER;
var pass = process.env.JENKINS_PASS;

request
  .post(
    'http://ec2-18-233-208-176.compute-1.amazonaws.com:8080/pipeline-model-converter/toJson',
    function(error, response, body) {
      if (response.statusCode == 200) {
        var jenkins_json = JSON.parse(body)['data']['json'];

        console.log(JSON.stringify(jenkins_json, null, 4));
      } else if (error != null) {
        console.error(error);
      }
    }
  )
  .auth(user, pass)
  .form({ jenkinsfile: jenkinsin.toString() });
