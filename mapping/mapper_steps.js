const isLiteral = (step) => {
  if (
    Object.prototype.hasOwnProperty.call(step[`arguments`][0][`value`], `isLiteral`) &&
    !step[`arguments`][0][`value`][`isLiteral`]
  ) {
    return false;
  } else {
    return true;
  }
};

const fnPerVerb = (stepsArr) => {
  let steps = [];
  stepsArr.map((step) => {
    if (!isLiteral(step)) {
      let stepObject = {};
      stepObject[`run`] = {};
      stepObject[`run`][`name`] =
        'Translation of non-literal commands are not supported by the JFC';
      stepObject[`run`][`command`] = 'exit 1';
      stepObject[`run`][`STACK_TRACE`] = step.name + ' ' + step[`arguments`][0][`value`][`value`];
      steps.push(stepObject);
    } else {
      let output = directiveToCommand(step);
      if (!Array.isArray(output)) {
        steps.push(output);
      } else {
        output.map((stepObject) => steps.push(stepObject));
      }
    }
  });
  return steps;
};

const directiveToCommand = (step) => {
  let stepObject = {};

  const directives = {
    sh: () => {
      // {"sh":  "Shell command"}
      if (!step[`arguments`][0][`value`][`isLiteral`]) {
        stepObject[`run`] = {};
        stepObject[`run`][`command`] = 'exit 1';
        stepObject[`run`][`name`] =
          'Translation of non-literal commands are not currently supported by this tool';
      } else {
        stepObject[`run`] = step[`arguments`][0][`value`][`value`];
      }
      return stepObject;
    },
    echo: () => {
      // {"echo":  "Print Message"}
      stepObject[`run`] = 'echo "' + step[`arguments`][0][`value`][`value`] + '"';
      return stepObject;
    },
    sleep: () => {
      // {"sleep":  "Sleep"}
      stepObject[`run`] = 'sleep ' + step[`arguments`][0][`value`][`value`];
      return stepObject;
    },
    catchError: () => {
      // {"catchError": "Catch error and set build result to failure"}
      // Consider `when` step
      stepObject[`run`] = {};
      stepObject[`run`][`command`] = 'exit 1';
      stepObject[`run`][`name`] = 'catchError is not currently supported.';
      stepObject[`run`][`STACK_TRACE`] =
        'Please refer to the `when` documentation for advice on usage \
                https://circleci.com/docs/2.0/configuration-reference/#the-when-step-requires-version-21\n \
                https://support.circleci.com/hc/en-us/articles/360043188514-How-to-Retry-a-Failed-Step-with-when-Attribute-';
      return stepObject;
    },
    dir: () => {
      // {"dir":  "Change current directory"}
      let stepsArr = fnPerVerb(step.children);
      stepsArr.map((stepObj) => (stepObj[`working_directory`] = step.arguments.value));
      return stepsArr;
    },
    // {"deleteDir":  "Recursively delete the current directory from the workspace"}
    // {"error":  "Error signal"}
    // {"fileExists":  "Verify if file exists in workspace"}
    // {"isUnix":  "Checks if running on a Unix-like node"}
    // {"mail":  "Mail"}
    // {"pwd":  "Determine current directory"}
    // {"readFile":  "Read file from workspace"}
    // {"retry":  "Retry the body up to N times"}
    // {"stash":  "Stash some files to be used later in the build"}
    // {"step":  "General Build Step"}
    // {"timeout":  "Enforce time limit"}
    // {"tool":  "Use a tool from a predefined Tool Installation"}
    // {"unstable":  "Set stage result to unstable"}
    // {"unstash":  "Restore files previously stashed"}
    // {"waitUntil":  "Wait for condition"}
    // {"warnError":  "Catch error and set build and stage result to unstable"}
    // {"withEnv":  "Set environment variables"}
    // {"wrap":  "General Build Wrapper"}
    // {"writeFile":  "Write file to workspace"}
    // {"archive":  "Archive artifacts"}
    // {"getContext":  "Get contextual object from internal APIs"}
    // {"unarchive":  "Copy archived artifacts into the workspace"}
    // {"withContext":  "Use contextual object from inte"}
    default: () => {
      stepObject[`run`] = {};
      stepObject[`run`][`name`] = 'Unsupported keyword.\n';
      stepObject[`run`][`command`] = 'exit 1';
      stepObject[`run`][`STACK_TRACE`] += step.name + ' ' + step.arguments[0].value.value;
      return stepObject;
    }
  };
  return (directives[step.name] || directives['default'])();
};

module.exports = { directiveToCommand, fnPerVerb };
