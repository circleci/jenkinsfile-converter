# Jenkinsfile Converter

A tool to help Jenkins users get a head start on building on CircleCI by converting a `Jenkinsfile` to CircleCI `config.yml`.

While this tool should output a valid `config.yml`, this tool is not yet feature complete. `config.yml` should be reviewed and edited as necessary before running the initial CircleCI build.

For more about CircleCI, see https://circleci.com

## Quick start

`curl --data-binary @your-jenkinsfile.groovy https://jenkinsto.cc/i`

where `your-jenkinsfile.groovy` is a path to your Jenkinsfile to convert.

## Companion Guide

Please read the [companion guide](GUIDE.md) after converting your Jenkinsfile to a config.yml to better understand the output and to get the most out of your CircleCI configuration.

## Supported Syntax

Only declarative (pipeline) `Jenkinsfile`s are currently supported.

| Jenkinsfile Syntax | Approx. CircleCI Syntax                                                                          | Status                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| agent              | [executor](https://circleci.com/docs/2.0/configuration-reference/#executors-requires-version-21) | Static                                                                                |
| post               | [when attribute](https://circleci.com/docs/2.0/configuration-reference/#the-when-attribute)      | See [when](https://circleci.com/docs/2.0/configuration-reference/#the-when-attribute) |
| stages             | [workflows](https://circleci.com/docs/2.0/workflows/)                                            | Supported                                                                             |
| steps              | [step](https://circleci.com/docs/2.0/jobs-steps/#steps-overview)                                 | Limited                                                                               |
| environment        | [environment](https://circleci.com/docs/2.0/env-vars/)                                           | Unsupported                                                                           |
| options            | N/A                                                                                              | See [Supported Jenkins Plugins](#supported-jenkins-plugins)                           |
| parameters         | [parameters](https://circleci.com/docs/2.0/reusing-config/#using-the-parameters-declaration)     | Unsupported                                                                           |
| triggers           | [cron](https://circleci.com/docs/2.0/workflows/#scheduling-a-workflow)                           | Unsupported                                                                           |
| stage              | [job](https://circleci.com/docs/2.0/configuration-reference/#jobs)                               | Supported                                                                             |

With regards to specific [Jenkinsfile steps](https://www.jenkins.io/doc/pipeline/steps/), the steps that are directly translated over to a CircleCI config.yml can be referenced [here](./mapping/mapper_steps.js). We are continuously rolling out specific feedback translation for each step. Please submit an [issue](./.github/CONTRIBUTING.md) if there's a step you believe deserves supporting!

## Supported Jenkins plugins

**Important Note: Jenkinsfiles relying on plugins not listed below cannot be converted**. Please remove stanzas relying on those unsupported plugins (e.g. `options`), otherwise <u>you will see an error message saying something is "Unknown" or "Invalid"</u>. If there is a request to add a plugin to the list, please feel free to open an issue!

- Pipeline: Groovy (`workflow-cps`)
- Pipeline: Shared Groovy Libraries (`workflow-cps-global-lib`)
- Timestamper (`timestamper`)
- Pipeline: Declarative Extension Points API (`pipeline-model-extensions`)
- Pipeline: Supporting APIs (`workflow-support`)
- Display URL API (`display-url-api`)
- Pipeline (`workflow-aggregator`)
- Plain Credentials Plugin (`plain-credentials`)
- Jenkins JSch dependency plugin (`jsch`)
- Branch API Plugin (`branch-api`)
- Pipeline: Input Step (`pipeline-input-step`)
- Ant Plugin (`ant`)
- Jenkins GIT server Plugin (`git-server`)
- Gradle Plugin (`gradle`)
- GitHub plugin (`github`)
- Pipeline Graph Analysis Plugin (`pipeline-graph-analysis`)
- Jenkins Subversion Plug-in (`subversion`)
- Folders Plugin (`cloudbees-folder`)
- JavaScript GUI Lib: Handlebars bundle plugin (`handlebars`)
- Trilead API Plugin (`trilead-api`)
- SSH Build Agents plugin (`ssh-slaves`)
- Pipeline: Step API (`workflow-step-api`)
- Pipeline: Basic Steps (`workflow-basic-steps`)
- Pipeline: Stage Tags Metadata (`pipeline-stage-tags-metadata`)
- Durable Task Plugin (`durable-task`)
- Pipeline: Stage Step (`pipeline-stage-step`)
- Command Agent Launcher Plugin (`command-launcher`)
- Lockable Resources plugin (`lockable-resources`)
- JavaScript GUI Lib: ACE Editor bundle plugin (`ace-editor`)
- Matrix Authorization Strategy Plugin (`matrix-auth`)
- Docker Commons Plugin (`docker-commons`)
- SCM API Plugin (`scm-api`)
- OWASP Markup Formatter Plugin (`antisamy-markup-formatter`)
- Pipeline: SCM Step (`workflow-scm-step`)
- GitHub API Plugin (`github-api`)
- Docker Pipeline (`docker-workflow`)
- Pipeline: GitHub Groovy Libraries (`pipeline-github-lib`)
- Pipeline: Milestone Step (`pipeline-milestone-step`)
- Structs Plugin (`structs`)
- Authentication Tokens API Plugin (`authentication-tokens`)
- MapDB API Plugin (`mapdb-api`)
- SSH Credentials Plugin (`ssh-credentials`)
- Pipeline: Nodes and Processes (`workflow-durable-task-step`)
- Pipeline: Model API (`pipeline-model-api`)
- Jenkins Git plugin (`git`)
- Jenkins Workspace Cleanup Plugin (`ws-cleanup`)
- Jenkins Mailer Plugin (`mailer`)
- JavaScript GUI Lib: jQuery bundles (jQuery and jQuery UI) plugin (`jquery-detached`)
- Pipeline: Declarative Agent API (`pipeline-model-declarative-agent`)
- Pipeline: Stage View Plugin (`pipeline-stage-view`)
- Pipeline: API (`workflow-api`)
- JUnit Plugin (`junit`)
- Email Extension Plugin (`email-ext`)
- Jenkins Git client plugin (`git-client`)
- Credentials Plugin (`credentials`)
- Pipeline: Job (`workflow-job`)
- PAM Authentication plugin (`pam-auth`)
- GitHub Branch Source Plugin (`github-branch-source`)
- Pipeline: Declarative (`pipeline-model-definition`)
- Matrix Project Plugin (`matrix-project`)
- bouncycastle API Plugin (`bouncycastle-api`)
- Build Timeout (`build-timeout`)
- Oracle Java SE Development Kit Installer Plugin (`jdk-tool`)
- Credentials Binding Plugin (`credentials-binding`)
- Pipeline: Build Step (`pipeline-build-step`)
- Script Security Plugin (`script-security`)
- LDAP Plugin (`ldap`)
- Jackson 2 API Plugin (`jackson2-api`)
- Token Macro Plugin (`token-macro`)
- Jenkins Apache HttpComponents Client 4.x API Plugin (`apache-httpcomponents-client-4-api`)
- JavaScript GUI Lib: Moment.js bundle plugin (`momentjs`)
- Resource Disposer Plugin (`resource-disposer`)
- Pipeline: Multibranch (`workflow-multibranch`)
- Pipeline: REST API Plugin (`pipeline-rest-api`)

## For devs: Contributing and testing locally

Please visit our [Contributing Guide](./.github/CONTRIBUTING.md) for information regarding contribution guidelines and local setup.

## License

[MIT](https://opensource.org/licenses/MIT)
