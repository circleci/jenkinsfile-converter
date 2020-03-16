const { padding } = require('./configGen.js');

const workflowsPreamble = () =>`
workflows:
  version: 2
  build-test-deploy:
    jobs:
`


const writeJobToWorkflow = (job) => {
  // only run steps for the most naive implementation
  return padding('- ' + job.name, 6);
}

const writeRequires = (job) => {
  return `:
          requires:
              - ` + job.name;
}

const writeWorkflows = (workflow) => {
  let output = workflowsPreamble();
  let firstLine = true;
  for (let i = 0; i < workflow.jobs.length; i++) {
    output += writeJobToWorkflow(workflow.jobs[i]);
    if (firstLine) {
      firstLine = !firstLine
      output += '\n'
    } else {
      output += writeRequires(workflow.jobs[i-1]) + '\n';
    } 
  }
  return output;
}

module.exports = { writeJobToWorkflow, writeRequires, writeWorkflows }