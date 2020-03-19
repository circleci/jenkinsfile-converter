const pullDirective = (l) => {
  if (l.trim().endsWith('{')) {
    return l.substring(0, l.indexOf('{')).trim();
  }
  return false;
};

const checkDirective = (l, d) => l.trim().startsWith(d) && l.trim().endsWith('{');

// isBalanced verifies that brackets are balanaced throughout the config
const isBalanced = ([...str]) => {
  return (
    str.reduce((uptoPrevChar, thisChar) => {
      ((thisChar === '(' && uptoPrevChar++) || (thisChar === ')' && uptoPrevChar--)) &&
        ((thisChar === '{' && uptoPrevChar++) || (thisChar === '}' && uptoPrevChar--)) &&
        ((thisChar === '[' && uptoPrevChar++) || (thisChar === ']' && uptoPrevChar--));

      return uptoPrevChar;
    }, 0) === 0
  );
};

const removeComments = (s) => s.replace(/\/\/.*?\n|#!.*?\n|\/\*[\s\S]*?\*\/?\n/g, '');

const jenkinsfileToArray = (s) => {
  return s
    .split('\n')
    .filter((str) => str.trim())
    .map((k) => k.trim());
};

// helper fn; expects arr with idx 0 that includes {, returns index of related }
const getBalancedIndex = (arr) => {
  let bracketCount = 0;
  // check first line has open curly brace
  if (arr[0].substr(-1, 1).trim() === '{') {
    bracketCount++;
  }
  // otherwise exit fn
  if (bracketCount === 0) {
    return false;
  }

  for (let i = 1; i < arr.length; i++) {
    bracketCount += Math.max(arr[i].split('{').length - 1, 0);
    bracketCount -= Math.max(arr[i].split('}').length - 1, 0);
    if (bracketCount === 0) {
      return i;
    }
  }
};

// getSection returns a JF stanza that has balanced brackets as an array
const getSection = (arr) => {
  return arr.slice(0, getBalancedIndex(arr) + 1);
};

module.exports = {
  pullDirective,
  checkDirective,
  isBalanced,
  removeComments,
  jenkinsfileToArray,
  getBalancedIndex,
  getSection
};
