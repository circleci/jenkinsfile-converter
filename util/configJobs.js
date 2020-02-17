const { padding, comment, multilineComment } = require('./configGen.js');

const jobsPreamble = () => `
jobs:
`

const isPotentialError = (cmd) => {
  if (cmd.indexOf(':') > -1) {
    return true
  } else {
    return false
  }
}

const writeJobSteps = (job) => {
  let output = ''
  for (let i = 0; i < job.steps.length; i++) {
    if (job.steps[i].cmd == '}' || job.steps[i].cmd == ']') {
      // Workaround to avoid hanging brackets. TODO: More holistic solution
    } else if (isPotentialError(job.steps[i].cmd)) {
      output += padding('- run: exit 1 # The following command will not run successfully on CircleCI. Please review our documentation.', 6) + '\n';
      output += padding('- run: ' + job.steps[i].cmd, 6) + '\n';
    } else
      output += padding('- run: ' + job.steps[i].cmd, 6) + '\n';
    }
  return output;
}

const writeJobs = (workflow) => {
  let output = jobsPreamble();
  for (let i = 0; i < workflow.jobs.length; i++) {
    output += padding(workflow.jobs[i].name + ':\n', 2);
    // TODO: Non-static executor entries
    output += padding('executor: default\n', 4);
    output += padding('steps:\n', 4);
    output += writeJobSteps(workflow.jobs[i]);
  }
  return output;
}

module.exports = { writeJobs }