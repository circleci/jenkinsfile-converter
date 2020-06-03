pipeline {
    agent none

    environment {
      FOO = "BAR"
    }

    stages {
        stage("build and deploy on Windows and Linux") {
            stages {
                stage("windows") {
                    agent {
                        label "windows"
                    }
                    stages {
                        stage("build") {
                          steps {
                              bat "run-build.bat"
                          }
                        }

                        stage("sequential in sequential") {
                          parallel {
                            stage("test1") {
                              environment {
                                BAR = "FOO"
                              }
                              steps {
                                echo "test 1"
                              }
                            } 
                            stage("test2") {
                              steps {
                                echo "test 2"
                              }
                            }
                          }
                        }

                        stage("deploy") {
                            when {
                                branch "master"
                            }
                            steps {
                                sh "run-deploy.bat"
                            }
                        }
                    }
                }

                stage("linux") {
                    agent {
                        label "linux"
                    }
                    stages {
                        stage("build") {
                            steps {
                                sh "./run-build.sh"
                            }
                        }

                        stage("deploy") {
                            when {
                                branch "master"
                            }
                            steps {
                                sh "run-deploy.bat"
                            }
                        }
                    }
                }
            }
        }
    }
}