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
const { assignedFields, skewerCase } = require('./mapper_utils.js');
const { mapConditions } = require('./mapper_conditions.js');
const { mapEnvironment } = require('./mapper_directives.js');

const map = (arr) => {
  const config = new CircleConfig(2.1);
  const pipeline = arr['pipeline'];

  if (!pipeline) {
    console.log(
      'Pipeline object not found. Only declarative Jenkinsfiles are supported at this time.'
    );
    return undefined;
  }

  mapEnvironment(pipeline, 0);

  const stages = pipeline['stages'];

  if (!stages) {
    console.log('No stages detected in Jenkinsfile.');
    return undefined;
  }

  mapStages(stages, config);

  return config;
};

const mapStages = (stages, config) => {
  const workflow = new CircleWorkflowItem();
  // Hard-coded workflow name--no multiple workflow support yet
  config.workflows['build-and-test'] = workflow;

  let nextRequires; // Track the previous job(s) to be set as the condition for the next
  let appendName; // Append the parent nonstep stage name to prevent name collisions

  const mapChildren = (nestedStages, isParallel, envDepth = 1) => {
    // Creates a fan-out/fan-in workflow when going from parallel to sequential
    let requires = [];

    nestedStages.forEach((prop) => {
      if (prop.branches) {
        const conditions = new CircleWorkflowJobCondition();

        if (nextRequires) {
          conditions.requires = nextRequires;
        }

        const [jobName, job] = mapJob(prop, workflow, conditions, appendName, envDepth);

        if (isParallel) {
          requires.push(jobName);
        } else {
          nextRequires = [jobName];
        }

        config.jobs[jobName] = job;
      } else {
        appendName = skewerCase(prop.name);
        mapEnvironment(prop, envDepth);
        mapChildren(prop.parallel || prop.stages, prop.parallel, envDepth + 1);
        appendName = null;
      }
    });

    if (requires.length) {
      nextRequires = requires;
    }
  };

  mapChildren(stages);
};

const mapJob = (stage, workflow, conditions, appendName, envDepth) => {
  let job = new CircleJob();

  job.docker = [{ image: 'cimg/base' }];
  job.environment = mapEnvironment(stage, envDepth);

  mapConditions(stage, conditions);

  let jobName = skewerCase(stage.name);

  if (appendName) {
    jobName += `-${appendName}`;
  }

  if (assignedFields(conditions)) {
    workflow.jobs.push({ [jobName]: conditions });
  } else {
    workflow.jobs.push(jobName);
  }

  job.steps = fnPerVerb(stage.branches[0].steps);
  return [jobName, job];
};

module.exports = { map };
