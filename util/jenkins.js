const { CircleConfig } = require('../model/CircleConfig.js');
const { CircleJob } = require('../model/CircleJob.js')
const { pullDirective, checkDirective,
  removeComments, jenkinsfileToArray,
  getBalancedIndex, getSection } = require('./jfParse.js');

const commentsLib = {
  "post": {
    "reason": " is not directly transferrable from Jenkinsfile to config.yml.",
    "link": "https://circleci.com/docs/2.0/configuration-reference/#the-when-attribute"
  },
  "options": {
    "reason": " do not have a direct correlation to CircleCI syntax.",
    "link": "https://circleci.com/docs/2.0/configuration-reference/#workflows"
  },
  "triggers": {
    "reason": ` are supported in CircleCI, however we strongly recommend you achieve your
  #  first green build before implementing this feature.`,
    "link": "https://circleci.com/docs/2.0/workflows/#scheduling-a-workflow"
  },
  "when": {
    "reason": " is treated differently in CircleCI from Jenkins.",
    "link": "https://circleci.com/docs/2.0/configuration-reference/#the-when-attribute"
  }
}

const addCommentWithDescription = (circleConfig, kw, linesArr, userDict) => {
  const dict = userDict || commentsLib;

  try {
    circleConfig.comments.push(kw + dict[kw].reason);
    circleConfig.comments.push('Please refer to ' + dict[kw].link + ' for more information.');
    circleConfig.comments.push(linesArr.join(' '));
  }
  catch {
    circleConfig.comments.push(kw + ' is not recognized as a valid keyword.');
    circleConfig.comments.push(linesArr.join(' '));
  }
  finally {
    circleConfig.comments.push('');
  }
}

const getStageName = (str) => {
  let begin = str.indexOf('(') + 2;
  let len = str.lastIndexOf(')') - str.indexOf('(') - 3;
  return str.substr(begin, len);
}

const getSteps = (arr) => {
  let stepsArr = [];
  let endIndex = getBalancedIndex(arr);
  for (let i = 1; i < endIndex; i++) {
    // If the line doesn't begin with a directive, add a Step to Jobs
    if (!pullDirective(arr[i])) {
      stepsArr.push({ run: arr[i] })
    } else if (pullDirective(arr[i]).startsWith('script')) {
      // Handle script blocks. TODO: abstract to handle other kws https://jenkins.io/doc/pipeline/steps/
      let endScriptIndex = getBalancedIndex(arr.slice(i));
      let cmd = getSection(arr.slice(i)).join('\\\n');
      let step = { run: cmd };
      stepsArr.push(step);
      i += endScriptIndex;
    }
  }
  return stepsArr
}

// getEnvironment returns an kv obj of env vars. naive implementation
const getEnvironment = (arr) => {
  let env = {};
  for (let i = 0; i < arr.length; i++) {
    if (checkDirective(arr[i], 'environment')) {
      let list = getSection(arr.slice([i]))
      for (let j = 0; j < list.length; j++) {
        if (list[j].indexOf('=') > -1) {
          let kvArr = list[j].split('=').map(k => k.trim());
          env[kvArr[0]] = kvArr[1];
        }
      }
    }
  }
  return env;
}

// returns Workflow obj with Jobs
const processStanzas = (arr) => {
  const ret = new CircleConfig(2);

  const jobQueue = [];
  let lastJob = null;

  for (let i = 0; i < arr.length; i++) {
    if (checkDirective(arr[i], 'stages')) {
      // TODO: Sanity check how we want to handle 'stages'
    } else if (checkDirective(arr[i], 'stage')) {
      let stageName = getStageName(arr[i]);

      lastJob = new CircleJob();
      ret.jobs[stageName] = lastJob;
      jobQueue.push(stageName);

      {
        // TODO: Cleaner implementation of env vars
        lastJob.environment = getEnvironment(getSection(arr.slice([i])));

        if (lastJob.environment.hasOwnProperty() === false) {
          lastJob.environment = void 0;
        }
      }
    } else if (checkDirective(arr[i], 'agent')) {
      // TODO: Add logic to assign correct Docker executor based on JF
    } else if (checkDirective(arr[i], 'steps')) {
      // TODO: Less hacky
      lastJob.steps = getSteps(arr.slice([i]));
    } else if (checkDirective(arr[i], 'post')) {
      addCommentWithDescription(ret, 'post', getSection(arr.slice([i])));
    } else if (checkDirective(arr[i], 'options')) {
      addCommentWithDescription(ret, 'options', getSection(arr.slice([i])));
    } else if (checkDirective(arr[i], 'triggers')) {
      addCommentWithDescription(ret, 'triggers', getSection(arr.slice([i])));
    } else if (checkDirective(arr[i], 'when')) {
      addCommentWithDescription(ret, 'when', getSection(arr.slice([i])));
    }
  }

  // Remove empty jobs
  for (var i = jobQueue.length - 1; i >= 0; i--) {
    if (ret.jobs[jobQueue[i]].steps.length == 0) {
      jobQueue.splice(i, 1);
    }
  }

  ret.workflows["build-test-deploy"] = { jobs: [] };
  jobQueue.map((jobName, index) => {
    if (index === 0) {
      ret.workflows["build-test-deploy"].jobs.push(jobName);
    } else {
      const jobWithCondition = {};

      jobWithCondition[jobName] = {
        requires: [jobQueue[index - 1]]
      };

      ret.workflows["build-test-deploy"].jobs.push(jobWithCondition);
    }
  });

  // For debugging inside workflows object
  // for (var i = 0; i < workflow.jobs.length; i++) {
  //   console.log(workflow.jobs[i])
  // }

  return ret;
}

const parseJenkinsfile = (jenkinsfile) => {
  return processStanzas(jenkinsfileToArray(removeComments(jenkinsfile)));
}

module.exports = { parseJenkinsfile };
