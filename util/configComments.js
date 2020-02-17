const { commentsLib } = require ('../static/comments.js');
const { comment, multilineComment } = require('./configGen.js');

const applyCommentDescription = (kw, linesArr) => {
  let output = ''
  output += comment(kw + commentsLib[kw].reason);
  output += comment('Please refer to ' + commentsLib[kw].link + ' for more information.');
  output += multilineComment.apply(null, linesArr) + '\n';
  return output;
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


module.exports = { writeComments };