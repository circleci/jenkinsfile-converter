const Pipeline = function() {
  this.workflows = [];
}

const Workflow = function() {
  // Workflow-level env vars not supported
  // this.env = {};
  this.name = "";
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

const Step = function(cmd, supported) {
  this.env = {};
  this.kw = "";
  // boolean, used to write comments
  // this.supported = supported;
  this.supported = (kw) => {

  }
  // expect this to be a string
  this.cmd = cmd
}

const Comment = function(kw, body) {
  this.kw = kw;
  this.body = body;
}

module.exports = { Pipeline, Workflow, Job, Step }