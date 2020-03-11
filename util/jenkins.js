const { CircleConfig } = require('../model/CircleConfig.js');
const { CircleJob } = require('../model/CircleJob.js');
const { CircleJobDockerContainer } = require('../model/CircleJobDockerContainer.js')
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
    circleConfig.comments.push(linesArr.join('\n'));
  }
  catch {
    circleConfig.comments.push(kw + ' is not recognized as a valid keyword.');
    circleConfig.comments.push(linesArr.join('\n'));
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
      // https://github.com/heug/jenkinsfile-circleci/blob/dev/util/configJobs.js#L18
      if (arr[i] !== '}' && arr[i] !== ']') {
        // https://github.com/heug/jenkinsfile-circleci/blob/fae4632ac6ce68be037ed1499bfabc12fdd057f3/util/configJobs.js#L21
        // Traling space is to pass through Maven options
        if (arr[i].includes(': ')) {
          stepsArr.push({ run: 'echo "The following command will not run successfully on CircleCI. Please review our documentation." && exit 1' })
        }
        stepsArr.push({ run: arr[i] });
      }
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
  const ret = new CircleConfig(2.1);

  {
    // Preambles - define executors
    ret.executors = {
      advisory_for_users: `
# You can replace your executor in any job with an executor defined here.
# A good start would be replacing the image in your Docker executor with one of our convience images.
# The Docker executor meets the needs of over 80% of our users.
# https://circleci.com/docs/2.0/executor-types
# List of convenience images: https://circleci.com/docs/2.0/circleci-images/#latest-image-tags-by-language`,
      default: {
        docker: [new CircleJobDockerContainer('circleci/python:3.6')]
      },
      macos: {
        macos: {
          xcode: "10.1.0",
        },
        working_directory: '~/proj',
        shell: '/bin/bash --login'
      },
      windows: {
        machine: {
          image: "windows-server-2019:201908-06"
        },
        resource_class: 'windows.medium',
        shell: 'bash'
      }
    }

    ret.executors.default.working_directory = '~/proj';
  }

  {
    const jobQueue = [];
    let lastJob = null;

    for (let i = 0; i < arr.length; i++) {
      if (checkDirective(arr[i], 'stages')) {
        // TODO: Sanity check how we want to handle 'stages'
      } else if (checkDirective(arr[i], 'stage')) {
        let stageName = getStageName(arr[i]);

        lastJob = new CircleJob();

        lastJob.executor = 'default';
        {
          const envvars = getEnvironment(getSection(arr.slice([i])));
          const envvarKeys = Object.getOwnPropertyNames(envvars);

          if (envvarKeys.length > 0) {
            lastJob.environment = envvars;

            // TODO: If executor-level envvar is required uncomment below:
            /*{
              // Initialize envvar map for the default Docker executor
              // (If not present)
              if (ret.executors.default.docker[0].environment === void 0) {
                ret.executors.default.docker[0].environment = {};
              }

              Object.getOwnPropertyNames(envvars).forEach((key) => {
                ret.executors.default.docker[0].environment[key] = envvars[key];
              });
            }*/
          }
        }

        ret.jobs[stageName] = lastJob;
        jobQueue.push(stageName);

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

    ret.workflows["build-test-deploy"] = { jobs: [] };

    {
      let lastJob = '';
      jobQueue.forEach((jobName) => {
        if (ret.jobs[jobName].steps.length === 0) {
          delete ret.jobs[jobName];

          return;
        }

        if (ret.workflows["build-test-deploy"].jobs.length === 0) {
          ret.workflows["build-test-deploy"].jobs.push(jobName);
        } else {
          const jobWithCondition = {};

          jobWithCondition[jobName] = {
            requires: [lastJob]
          };

          ret.workflows["build-test-deploy"].jobs.push(jobWithCondition);
        }

        lastJob = jobName;
      });
    }
  }

  return ret;
}

const parseJenkinsfile = (jenkinsfile) => {
  return processStanzas(jenkinsfileToArray(removeComments(jenkinsfile)));
}

module.exports = { parseJenkinsfile };
