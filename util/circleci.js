const { writeExecutors } = require('./configExecutors.js');
const { writeWorkflows } = require('./configWorkflows.js');
const { writeJobs } = require('./configJobs.js');
const { writeComments } = require('./configComments.js');
const yaml = require('js-yaml');

const createConfig = (workflowObj) => {
  console.log(workflowObj);
  return yaml.safeDump(workflowObj, { skipInvalid: true });
}

module.exports = { createConfig };
