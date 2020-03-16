const { commentsLib } = require ('../static/comments.js');
const { comment, multilineComment } = require('./configGen.js');

const applyCommentDescription = (kw, linesArr, dict) => {
  let output = '';
  dict = dict || commentsLib;

  try {
    output += comment(kw + dict[kw].reason);
    output += comment('Please refer to ' + dict[kw].link + ' for more information.');
    output += multilineComment.apply(null, linesArr) + '\n';
  }
  catch {
    output += comment(kw + ' is not recognized as a valid keyword.');
    output += multilineComment.apply(null, linesArr) + '\n';
  }
  finally {
    return output;
  }
}

const writeComments = (workflow) => {
  let output = '\n\n';
  const commentArr = workflow.comments;
  for (let i = 0; i < commentArr.length; i++) {
    let kw = commentArr[i].kw;
    let linesArr = commentArr[i].body;
    output += applyCommentDescription(kw, linesArr);
  }
  return output;
}


module.exports = { applyCommentDescription, writeComments };