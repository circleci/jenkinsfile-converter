const { commentsLib } = require('../static/comments.js');

// Do we need this?
const Pipeline = function() {
  this.env = {};
  this.workflows = [];
}

const Workflow = function() {
  // AKA pipeline parameters
  this.env = {};
  this.name = "";
  // array of commented lines that are appended to the end of a config file
  this.comments = [];
  this.jobs = []; 
  this.addComment = (kw, body) => {
    this.comments.push(new Comment(kw, body));
  }
  this.addJob = (name) => {
    this.jobs.push(new Job(name));
  }
}

const Job = function(name) {
  this.name = name;
  this.env = {};
  this.steps = [];
  this.addStep = (cmd, supported) => {
    this.steps.push(new Step(cmd, supported));
  }
}

const Step = function(cmd) {
  this.env = {};
  this.kw = "";
  // expect this to be a string
  this.cmd = cmd
}

const Comment = function(kw, body) {
  this.kw = kw;
  this.body = body;
}

module.exports = { Pipeline, Workflow, Job, Step, Comment }