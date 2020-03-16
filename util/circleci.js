const { writeExecutors } = require('./configExecutors.js');
const { writeWorkflows } = require('./configWorkflows.js');
const { writeJobs } = require('./configJobs.js');
const { writeComments } = require('./configComments.js');

const createConfig = (workflowObj) => {
  let config = ''
  config += writeExecutors(workflowObj);
  config += writeWorkflows(workflowObj);
  config += writeJobs(workflowObj);
  config += writeComments(workflowObj);
  return config;
}

module.exports = { createConfig };
