// Generate a YAML comment from given text.
const comment = (text) => `# ${text}\n`;

// Generate indentention where X is the amount of spaces
const padding = (str, spaces) => ' '.repeat(spaces) + str;

// Given a number of strings, return a YAML multiline comment string
const multilineComment = (...text) => {
  return text
    .map((k) => {
      return comment(` ${k}`);
    })
    .join('');
};

// Provide an error message comment
const errorComment = (reason, refLine, numLine) => {
  // TODO: What would cause a reason to not be provided? Who is the owner?
  reason = reason
    ? reason
    : 'Something weird happened. Please contact $MAIN_CONTACT with your config and this message.';

  return multilineComment(`ERROR: ${reason}`, `Line #${numLine}:${refLine}`);
};

// Generates the disclaimer at the start of the config file
const generateHeader = () =>
  multilineComment(
    'This is an experimental convertor!',
    'Only declarative Jenkinsfiles are currently supported.'
  );

module.exports = { comment, padding, multilineComment, errorComment, generateHeader };
