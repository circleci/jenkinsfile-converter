/*

    This mapper file will contain these core features:
        Mapping JenksinsJSON object to CircleCI Model by recursively iterating over JSON object and it's children.
        Contain reference to a LUT which will source and destinations for each declaration
        Track which children were not properly translated
    
*/

const { CircleConfig } = require('../model/CircleConfig.js');
const { CircleJob } = require('../model/CircleJob.js');
const { CircleWorkflowItem } = require('../model/CircleWorkflowItem.js');
const { CircleWorkflowJobCondition } = require('../model/CircleWorkflowJobCondition.js');
const { fnPerVerb } = require('./mapper_steps.js');

const map = (arr) => {
  const config = new CircleConfig(2.1);
  const pipeline = arr['pipeline'];
  const stages = pipeline['stages'];

  if (!pipeline) {
    console.log(
      'pipeline object not found. Only declarative Jenkinsfiles are supported at this time.'
    );
  } else if (stages) {
    mapStages(stages, config);
  } else {
    console.log('No stages detected in Jenkinsfile.');
  }

  return config;
};

const mapStages = (stages, config) => {
  const workflow = new CircleWorkflowItem();
  // Hard-coded workflow name--no multiple workflow support yet
  config['workflows']['build-and-test'] = workflow;

  stages.forEach((stage) => {
    const workflowJobConditionObj = new CircleWorkflowJobCondition();
    let job = new CircleJob();
    let envVars = stage['environment'];

    if (workflow.jobs.length > 0) {
      let precedingJobName;
      if (workflow.jobs.length === 1) {
        precedingJobName = workflow.jobs[workflow.jobs.length - 1];
      } else {
        precedingJobName = Object.keys(workflow.jobs[workflow.jobs.length - 1]);
      }
      workflowJobConditionObj['requires'] = precedingJobName;
    }

    if (!stage.parallel) {
      let workflowJobName = stage.name;
      if (workflowJobConditionObj.requires === undefined) {
        workflow.jobs.push(workflowJobName);
      } else {
        workflow.jobs.push({ [workflowJobName]: workflowJobConditionObj });
      }

      job.steps = fnPerVerb(stage.branches[0].steps);
      config['jobs'][workflowJobName] = job;
    } else {
      stage.parallel.forEach((parallelStage) => {
        let workflowJobName = parallelStage.name;
        if (workflowJobConditionObj.requires === undefined) {
          workflow.jobs.push(workflowJobName);
        } else {
          workflow.jobs.push({ [workflowJobName]: workflowJobConditionObj });
        }

        job.steps = fnPerVerb(parallelStage.branches[0].steps);
        config['jobs'][workflowJobName] = job;
      });
    }

    if (envVars) {
      envVars.forEach((envVar) => {
        let key = envVar['key'];
        let value = envVar['value'];

        if (typeof value == 'object') {
          // TODO: Here we would handle things such as 'credentials(xxxx)', for now just using the value itself.
          // Currently grabbing the first argument from credentials(), need to check to see if there are possibly more to pass.
          value = value['arguments'][0]['value'];
        }
        job.environment[key] = value;
      });
    }
  });
};

module.exports = { map, mapStages };
