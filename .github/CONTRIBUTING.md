# Jenkinsfile Converter Contributing Guide
(Borrowed heavily from the contribution guide from the lovely folks at [vue.js](https://github.com/vuejs/vue))

Hello! And thank you for your interest in contributing to this project. Before submitting your contribution, please review the following guidelines:

* [Issue Reporting Guidelines](#issue-reporting-guidelines)
* [Pull Request Guidelines](#pull-request-guidelines)
* [Development Setup](#development-setup)
* [Project Structure](#project-structure)

## Issue Reporting Guidelines
Use the Issues tab in this project to submit bugs, feature requests, and enhancements. Please fill out all requested information contained within the templates.

## Pull Request Guidelines
* The master branch is just a snapshot of the latest stable release. All development should be done in dedicated branches. Do not submit PRs against the master branch.
* Checkout a topic branch from the relevant branch, e.g. dev, and merge back against that branch.
* Work in the `util` folder.
* It's OK to have multiple small commits as you work on the PR - GitHub will automatically squash it before merging.
* Make sure npm test passes. (see [development setup](#development-setup))

If adding a new feature:
* Add accompanying test case.
* Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

If fixing a bug:

* If you are resolving a special issue, add (fix #xxxx[,#xxxx]) (#xxxx is the issue id) in your PR title for a better release log, e.g. update entities encoding/decoding (fix #3899).
* Provide a detailed description of the bug in the PR.
* Add appropriate test coverage if applicable.

## Development Setup
This project is built in Node.js version 12, and uses npm as the dependency manager.

## Project Structure

* `util`: contains the source code. Codebase is written in ES2016. The entrypoint to the converter is `~/index.js`
* `static`: contains a dictionary on unsupported Jenkinsfile keywords and returns the relevant link to CircleCI documentation.
* `model`: contains the data models into which Jenkinsfile data is loaded before reconstructing into `config.yml`. Written with CommonJS.
* `test`: All tests are written with Mocha and Chai. `createConfigs.sh` and `validateConfigs.sh` are shell scripts that will call `index.js` recursively on all Jenkinsfiles contained with `test`, and then run `circleci config validate` (see [CircleCI Local CLI](https://circleci.com/docs/2.0/local-cli/)) on each config to run a smoke test on all resultant `config.yml` files.
