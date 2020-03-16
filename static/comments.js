const commentsLib = {
  "post": {
    "reason": " is not directly transferrable from Jenkinsfile to config.yml.",
    "link": "https://circleci.com/docs/2.0/configuration-reference/#the-when-attribute"
  },
  "options": {
    "reason": " do not have a direct correlation to CircleCI syntax.",
    "link": "https://circleci.com/docs/2.0/configuration-reference/#workflows"
  },
  "triggers": {
    "reason": ` are supported in CircleCI, however we strongly recommend you achieve your
#  first green build before implementing this feature.`,
    "link": "https://circleci.com/docs/2.0/workflows/#scheduling-a-workflow"
  },
  "when": {
    "reason": " is treated differently in CircleCI from Jenkins.",
    "link": "https://circleci.com/docs/2.0/configuration-reference/#the-when-attribute"
  }
}

module.exports = { commentsLib };