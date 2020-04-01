/*

    This mapper file will contain these core features:
        Mapping JenksinsJSON object to CircleCI Model by recursively iterating over JSON object and it's children.
        Contain reference to a LUT which will source and destinations for each declaration
        Track which children were not properly translated
    
*/
const { CircleConfig } = require('../model/CircleConfig.js');
const { CircleJob } = require('../model/CircleJob.js');

const map = (arr) => {
  const config = new CircleConfig(2.1);

  const pipeline = arr['pipeline'];
  const stages = pipeline['stages'];

  if (stages) {
    mapStages(stages, config);
  }

  return config;
};

const mapStages = (stages, config) => {
  stages.forEach((stage) => {
    const job = new CircleJob();
    const envVars = stage['environment'];

    if (envVars) {
      job.environment = {};

      envVars.forEach((envVar) => {
        const key = envVar['key'];
        var value = envVar['value'];

        if (typeof value == 'object') {
          // TODO: Here we would handle things such as 'credentials(xxxx)', for now just using the value itself.
          // Currently grabbing the first argument from credentials(), need to check to see if there are possibly more to pass.
          value = value['arguments'][0]['value'];
        }

        job.environment[key] = value;
      });
    }

    config['jobs'][stage.name] = job;
  });
};

module.exports = { map };
