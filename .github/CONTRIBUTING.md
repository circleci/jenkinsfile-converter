# Jenkinsfile Converter Contributing Guide

(Borrowed heavily from the contribution guide from the lovely folks at [vue.js](https://github.com/vuejs/vue))

Hello! And thank you for your interest in contributing to this project. Before submitting your contribution, please review the following guidelines:

- [Issue Reporting Guidelines](#issue-reporting-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)

## Issue Reporting Guidelines

Use the Issues tab in this project to submit bugs, feature requests, and enhancements. Please fill out all requested information contained within the templates.

## Pull Request Guidelines

- The master branch is just a snapshot of the latest stable release. All development should be done in dedicated branches. Do not submit PRs against the master branch.
- Checkout a topic branch from the relevant branch, e.g. dev, and merge back against that branch.
- Work in the `util` folder.
- It's OK to have multiple small commits as you work on the PR - GitHub will automatically squash it before merging.
- Make sure npm test passes. (see [development setup](#development-setup))

If adding a new feature:

- Add accompanying test case.
- Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

If fixing a bug:

- If you are resolving a special issue, add (fix #xxxx[,#xxxx]) (#xxxx is the issue id) in your PR title for a better release log, e.g. update entities encoding/decoding (fix #3899).
- Provide a detailed description of the bug in the PR.
- Add appropriate test coverage if applicable.

## Development Setup - testing locally

This project is built in Node.js version 12, and uses npm as the dependency manager.

`node index.js [path/to/Jenkinsfile] [path/to/output]` will convert a Jenkinsfile to the desired location. `path/to/output` is an optional argument - if omitted, no file will be created. Regardless of whether the output location is specified or not, the result will be shown in your console.

## Development endpoints

Jenkinsfiles can be converted into the JSON format that is then ingested by the converter by curling the Jenkinsfile to https://jenkinsto.cc/i/to-json.

## Project Structure

- `mapping`: contains the core logic for converting a Jenkinsfile JSON to config.yml. Codebase is written in ES2016.
- `model`: contains the data models into which the building blocks of a CircleCI config (e.g. workflows, jobs, steps) are loaded into before hydration into `config.yml` via [js-yaml](https://github.com/nodeca/js-yaml). Written with CommonJS.
- `server`: code for running the JFC as an API service. Written in nodeJS.
- `test`: All tests are written with Mocha and Chai. `createConfigs.sh` and `validateConfigs.sh` are shell scripts that will call `index.js` recursively on all Jenkinsfiles contained with `test`, and then run `circleci config validate` (see [CircleCI Local CLI](https://circleci.com/docs/2.0/local-cli/)) on each config to run a smoke test on all resultant `config.yml` files.
