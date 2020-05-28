const envVarLayers = {};

const mapEnvironment = (prop, envDepth) => {
  const envVars = prop['environment'];

  let mappedEnvVars = {};

  for (let i = 0; i < envDepth; i++) {
    if (envVarLayers[i]) {
      mappedEnvVars = { ...mappedEnvVars, ...envVarLayers[i] };
    }
  }

  if (envVars) {
    envVars.forEach((ev) => {
      let key = ev['key'];
      let value = ev['value'];

      // TODO: handle credentials() and nonliteral functions

      if (value.isLiteral) {
        mappedEnvVars[key] = value.value;
      } else {
        mappedEnvVars[key] = 'Unsupported Environment Variable Type!';
      }
    });
  }

  if (Object.values(mappedEnvVars).length) {
    envVarLayers[envDepth] = mappedEnvVars;

    return mappedEnvVars;
  }

  return undefined;
};

module.exports = { mapEnvironment };
