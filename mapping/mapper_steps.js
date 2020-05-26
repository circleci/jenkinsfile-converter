const { isLiteral } = require('./mapper_utils.js');

const fnPerVerb = (stepsArr) => {
  let steps = [];
  stepsArr.map((step) => {
    let output = directiveToCommand(step);
    if (!Array.isArray(output)) {
      steps.push(output);
    } else {
      output.map((stepObject) => steps.push(stepObject));
    }
  });
  return steps;
};

const directiveToCommand = (step) => {
  let stepObject = {};

  const directives = {
    script: () => {
      // {"sh":  "Run arbitrary Java"}
      stepObject[`run`] = {};
      stepObject[`run`][`name`] = 'Consider re-writing as a CircleCI run step';
      stepObject[`run`][`command`] = 'exit 1';
      stepObject[`run`][`JFC_STACK_TRACE`] =
        'Please refer to environment variable documentation for more information' +
        'https://circleci.com/docs/2.0/configuration-reference/#run' +
        step.name +
        ' ' +
        step[`arguments`][0][`value`][`value`];
      return stepObject;
    },
    sh: () => {
      // {"sh":  "Shell command"}
      stepObject[`run`] = {};
      if (!isLiteral(step)) {
        stepObject[`run`][`name`] = 'Confirm environment variables are set before running';
        stepObject[`run`][`command`] = 'exit 1';
        stepObject[`run`][`JFC_STACK_TRACE`] =
          'Please refer to environment variable documentation for more information' +
          '\nhttps://circleci.com/docs/2.0/env-vars/\n' +
          step.name +
          ' ' +
          step[`arguments`][0][`value`][`value`];
      } else {
        stepObject[`run`][`command`] = step[`arguments`][0][`value`][`value`];
      }
      return stepObject;
    },
    echo: () => {
      // {"echo":  "Print Message"}
      stepObject[`run`] = {};
      stepObject[`run`][`command`] = 'echo "' + step[`arguments`][0][`value`][`value`] + '"';
      return stepObject;
    },
    sleep: () => {
      // {"sleep":  "Sleep"}
      stepObject[`run`] = {};
      stepObject[`run`][`command`] = 'sleep ' + step[`arguments`][0][`value`][`value`];
      return stepObject;
    },
    catchError: () => {
      // {"catchError": "Catch error and set build result to failure"}
      // Consider `when` step
      stepObject[`run`] = {};
      stepObject[`run`][`name`] = 'Use conditional steps';
      stepObject[`run`][`command`] = 'exit 1';
      stepObject[`run`][`JFC_STACK_TRACE`] =
        step.name +
        ' ' +
        step[`arguments`][0][`value`][`value`] +
        'Please refer to the `when` documentation for advice on usage \
                https://circleci.com/docs/2.0/configuration-reference/#the-when-step-requires-version-21\n \
                https://support.circleci.com/hc/en-us/articles/360043188514-How-to-Retry-a-Failed-Step-with-when-Attribute-';
      return stepObject;
    },
    dir: () => {
      // {"dir":  "Change current directory"}
      let stepsArr = fnPerVerb(step.children);
      stepsArr.forEach((stepObject) => {
        stepObject[`run`][`working_directory`] = step.arguments.value;
      });
      return stepsArr;
    },
    mail: () => {
      // {"mail":  "Mail"}
      stepObject[`run`] = {};
      stepObject[`run`][`name`] = 'Use built-in e-mail notifications';
      stepObject[`run`][`command`] = 'exit 1';
      stepObject[`run`][`JFC_STACK_TRACE`] =
        step.name +
        ' ' +
        step[`arguments`][0][`value`][`value`] +
        'Please refer to our documentation for how to set and change various types of notification \
                https://circleci.com/docs/2.0/notifications/';
      return stepObject;
    },
    error: () => {
      // {"error":  "Error signal"}
      // Consider `when` step
      stepObject[`run`] = {};
      stepObject[`run`][`name`] = 'Use conditional steps';
      stepObject[`run`][`command`] = 'exit 1';
      stepObject[`run`][`JFC_STACK_TRACE`] =
        step.name +
        ' ' +
        step[`arguments`][0][`value`][`value`] +
        'Please refer to the `when` documentation for advice on usage \
                https://circleci.com/docs/2.0/configuration-reference/#the-when-step-requires-version-21\n \
                https://support.circleci.com/hc/en-us/articles/360043188514-How-to-Retry-a-Failed-Step-with-when-Attribute-';
      return stepObject;
    },
    pwd: () => {
      // {"pwd":  "Determine current directory"}
      stepObject[`run`] = {};
      stepObject[`run`][`name`] = 'Print working directory';
      stepObject[`run`][`command`] = 'pwd';
      return stepObject;
    },
    fileExists: () => {
      // {"fileExists":  "Verify if file exists in workspace"}
      // Consider `when` step
      stepObject[`run`] = {};
      stepObject[`run`][`name`] = 'Check if file exists';
      stepObject[`run`][`command`] =
        'if test -f "' +
        step[`arguments`][0][`value`][`value`] +
        '"; then \
          echo "file exists" \
          exit 0" \
        fi \
        exit 1';
      return stepObject;
    },
    withEnv: () => {
      // {"withEnv":  "Set environment variables"}
      let jenkinsEnvVarArr = step.arguments.value.split(',');
      let jsonEnvVarArr = [];

      jenkinsEnvVarArr.forEach((envVar) => {
        jsonEnvVarArr.push(envVar.substring(1, envVar.length - 1));
      });
      jsonEnvVarArr[0] = jsonEnvVarArr[0].substring(3);
      jsonEnvVarArr[jsonEnvVarArr.length - 1] = jsonEnvVarArr[jsonEnvVarArr.length - 1].substring(
        0,
        jsonEnvVarArr[jsonEnvVarArr.length - 1].length - 2
      );

      let envVarObj = jsonEnvVarArr.reduce((obj, kv) => {
        let kvParts = kv.split('=');
        if (kvParts[0] && kvParts[1]) {
          obj[kvParts[0]] = kvParts[1];
        }
        return obj;
      }, {});

      let fullEnvObj = {};
      for (var key in envVarObj) {
        fullEnvObj[key] = envVarObj[key];
      }

      let stepsArr = fnPerVerb(step.children);
      stepsArr.forEach((stepObject) => {
        stepObject[`run`][`name`] = 'Run command with defined env vars';
        stepObject[`run`][`environment`] = fullEnvObj;
      });

      return stepsArr;
    },
    readFile: () => {
      // {"readFile":  "Read file from workspace"}
      stepObject[`run`] = {};
      stepObject[`run`][`name`] = 'Running readFile with cat';
      stepObject[`run`][`command`] = 'cat ' + step[`arguments`][0][`value`][`value`];
      return stepObject;
    },
    // {"deleteDir":  "Recursively delete the current directory from the workspace"}
    // {"isUnix":  "Checks if running on a Unix-like node"}
    // {"retry":  "Retry the body up to N times"}
    // {"step":  "General Build Step"}
    // {"timeout":  "Enforce time limit"}
    // {"tool":  "Use a tool from a predefined Tool Installation"}
    // {"unstable":  "Set stage result to unstable"}
    // {"unstash":  "Restore files previously stashed"}
    // {"waitUntil":  "Wait for condition"}
    // {"warnError":  "Catch error and set build and stage result to unstable"}
    // {"wrap":  "General Build Wrapper"}
    // {"writeFile":  "Write file to workspace"}
    // {"archive":  "Archive artifacts"}
    // {"getContext":  "Get contextual object from internal APIs"}
    // {"unarchive":  "Copy archived artifacts into the workspace"}
    // {"withContext":  "Use contextual object from inte"}
    default: () => {
      stepObject[`run`] = {};
      stepObject[`run`][`name`] = 'Keyword not recognized\n';
      stepObject[`run`][`command`] = 'exit 1';
      stepObject[`run`][`JFC_STACK_TRACE`] =
        'Please refer to CircleCI documentation (https://circleci.com/docs/reference-2-1/#section=configuration)\n' +
        'and/or submit an issue at https://github.com/circleci/jenkinsfile-converter\n' +
        step.name +
        ' ' +
        step.arguments[0].value.value;
      return stepObject;
    }
  };
  return (directives[step.name] || directives['default'])();
};

module.exports = { directiveToCommand, fnPerVerb };
