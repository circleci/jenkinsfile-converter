# Jenkinsfile Converter

A tool to help Jenkins users get a head start on building on CircleCI by converting a `Jenkinsfile` to CircleCI `config.yml`.

While this tool should output a valid `config.yml`, this tool is not yet feature complete. `config.yml` should be reviewed and edited as necessary before running the initial CircleCI build.

For more about CircleCI, see https://circleci.com

## Quick start

`curl --data-binary @your-jenkinsfile.groovy https://jenkinsto.cc/i`

where `your-jenkinsfile.groovy` is a path to your Jenkinsfile to convert.

For example, `curl --data-binary @./configs/myJenkinsFile.groovy https://jenkinsto.cc/i`

## Limitations

* Limited number of syntaxes and plugins are supported. Jenkinsfiles relying on unsupported syntaxes and plugins cannot be converted. Please manually remove them.

* Only `Default` is supported as a tool name for `maven`, `jdk` and `gradle` in [`tools` block](https://www.jenkins.io/doc/book/pipeline/syntax/#tools) and other names will cause conversion failures. Please configure them appropriately or remove them manually.

  For example, the following stanza:
  ```
  tools {
    maven 'Maven 3.6.3'
    jdk 'Corretto 8.232'
  }
  ```
  should be changed to:
  ```
  tools {
    maven 'Default'
    jdk 'Default'
  }
  ```

## Companion Guide

Please read the [companion guide](./docs/GUIDE.md) after converting your Jenkinsfile to a config.yml to better understand the output and to get the most out of your CircleCI configuration.

## Supported Syntax

Only declarative (pipeline) `Jenkinsfile`s are currently supported.

| Jenkinsfile Syntax | Approx. CircleCI Syntax                                                                          | Status                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| agent              | [executor](https://circleci.com/docs/2.0/configuration-reference/#executors-requires-version-21) | Static                                                                                |
| post               | [when attribute](https://circleci.com/docs/2.0/configuration-reference/#the-when-attribute)      | See [when](https://circleci.com/docs/2.0/configuration-reference/#the-when-attribute) |
| stages             | [workflows](https://circleci.com/docs/2.0/workflows/)                                            | Supported                                                                             |
| steps              | [step](https://circleci.com/docs/2.0/jobs-steps/#steps-overview)                                 | Limited                                                                               |
| environment        | [environment](https://circleci.com/docs/2.0/env-vars/)                                           | [Unsupported](https://github.com/circleci/jenkinsfile-converter/issues/26)                                                                           |
| options            | N/A                                                                                              | See [Supported Jenkins Plugins](#supported-jenkins-plugins)                           |
| parameters         | [parameters](https://circleci.com/docs/2.0/reusing-config/#using-the-parameters-declaration)     | Unsupported                                                                           |
| triggers           | [cron](https://circleci.com/docs/2.0/workflows/#scheduling-a-workflow)                           | Unsupported                                                                           |
| stage              | [job](https://circleci.com/docs/2.0/configuration-reference/#jobs)                               | Supported                                                                             |

With regards to specific [Jenkinsfile steps](https://www.jenkins.io/doc/pipeline/steps/), the steps that are directly translated over to a CircleCI config.yml can be referenced [here](./mapping/mapper_steps.js). We are continuously rolling out specific feedback translation for each step. Please submit an [issue](./.github/CONTRIBUTING.md) if there's a step you believe deserves supporting!

## Supported Jenkins plugins

**Important Note: Jenkinsfiles relying on plugins not listed below cannot be converted**. Please remove stanzas relying on those unsupported plugins (e.g. `options`), otherwise <u>you will see an error message saying something is "Unknown" or "Invalid"</u>. If there is a request to add a plugin to the list, please feel free to open an issue!

- Trilead API Plugin (`trilead-api`)
- Folders Plugin (`cloudbees-folder`)
- OWASP Markup Formatter Plugin (`antisamy-markup-formatter`)
- Script Security Plugin (`script-security`)
- Oracle Java SE Development Kit Installer Plugin (`jdk-tool`)
- Command Agent Launcher Plugin (`command-launcher`)
- Structs Plugin (`structs`)
- Pipeline: Step API (`workflow-step-api`)
- Token Macro Plugin (`token-macro`)
- bouncycastle API Plugin (`bouncycastle-api`)
- Build Timeout (`build-timeout`)
- Credentials Plugin (`credentials`)
- Plain Credentials Plugin (`plain-credentials`)
- SSH Credentials Plugin (`ssh-credentials`)
- Credentials Binding Plugin (`credentials-binding`)
- SCM API Plugin (`scm-api`)
- Pipeline: API (`workflow-api`)
- Timestamper (`timestamper`)
- Pipeline: Supporting APIs (`workflow-support`)
- Durable Task Plugin (`durable-task`)
- Pipeline: Nodes and Processes (`workflow-durable-task-step`)
- JUnit Plugin (`junit`)
- Matrix Project Plugin (`matrix-project`)
- Resource Disposer Plugin (`resource-disposer`)
- Jenkins Workspace Cleanup Plugin (`ws-cleanup`)
- Ant Plugin (`ant`)
- JavaScript GUI Lib: ACE Editor bundle plugin (`ace-editor`)
- JavaScript GUI Lib: jQuery bundles (jQuery and jQuery UI) plugin (`jquery-detached`)
- Pipeline: SCM Step (`workflow-scm-step`)
- Pipeline: Groovy (`workflow-cps`)
- Pipeline: Job (`workflow-job`)
- Jenkins Apache HttpComponents Client 4.x API Plugin (`apache-httpcomponents-client-4-api`)
- Display URL API (`display-url-api`)
- Jenkins Mailer Plugin (`mailer`)
- Pipeline: Basic Steps (`workflow-basic-steps`)
- Gradle Plugin (`gradle`)
- Pipeline: Milestone Step (`pipeline-milestone-step`)
- Jackson 2 API Plugin (`jackson2-api`)
- Pipeline: Input Step (`pipeline-input-step`)
- Pipeline: Stage Step (`pipeline-stage-step`)
- Pipeline Graph Analysis Plugin (`pipeline-graph-analysis`)
- Pipeline: REST API Plugin (`pipeline-rest-api`)
- JavaScript GUI Lib: Handlebars bundle plugin (`handlebars`)
- JavaScript GUI Lib: Moment.js bundle plugin (`momentjs`)
- Pipeline: Stage View Plugin (`pipeline-stage-view`)
- Pipeline: Build Step (`pipeline-build-step`)
- Pipeline: Model API (`pipeline-model-api`)
- Pipeline: Declarative Extension Points API (`pipeline-model-extensions`)
- Jenkins JSch dependency plugin (`jsch`)
- Jenkins Git client plugin (`git-client`)
- Jenkins GIT server Plugin (`git-server`)
- Pipeline: Shared Groovy Libraries (`workflow-cps-global-lib`)
- Branch API Plugin (`branch-api`)
- Pipeline: Multibranch (`workflow-multibranch`)
- Authentication Tokens API Plugin (`authentication-tokens`)
- Docker Commons Plugin (`docker-commons`)
- Docker Pipeline (`docker-workflow`)
- Pipeline: Stage Tags Metadata (`pipeline-stage-tags-metadata`)
- Pipeline: Declarative Agent API (`pipeline-model-declarative-agent`)
- Pipeline: Declarative (`pipeline-model-definition`)
- Lockable Resources plugin (`lockable-resources`)
- Pipeline (`workflow-aggregator`)
- GitHub API Plugin (`github-api`)
- Jenkins Git plugin (`git`)
- GitHub plugin (`github`)
- GitHub Branch Source Plugin (`github-branch-source`)
- Pipeline: GitHub Groovy Libraries (`pipeline-github-lib`)
- MapDB API Plugin (`mapdb-api`)
- Jenkins Subversion Plug-in (`subversion`)
- SSH Build Agents plugin (`ssh-slaves`)
- Matrix Authorization Strategy Plugin (`matrix-auth`)
- PAM Authentication plugin (`pam-auth`)
- LDAP Plugin (`ldap`)
- Email Extension Plugin (`email-ext`)
- H2 API Plugin (`h2-api`)
- Config File Provider Plugin (`config-file-provider`)
- Pipeline Maven Integration Plugin (`pipeline-maven`)
- Pipeline Utility Steps (`pipeline-utility-steps`)

## For devs: Contributing and testing locally

Please visit our [Contributing Guide](./.github/CONTRIBUTING.md) for information regarding contribution guidelines and local setup.

## License

[MIT](https://opensource.org/licenses/MIT)
