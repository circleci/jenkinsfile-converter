pipeline {
  agent any
  stages {
    stage('Check Versions') {
      steps {
        sh 'gcloud --version'
        sh 'node -v && npm -v'
      }
    }
    stage('Install') {
      steps {
        sh '''npm install
cd react && npm install'''
      }
    }
    stage('Test') {
      steps {
        sh 'cd react && CI=true npm test'
      }
    }
    stage('Lint') {
      steps {
        sh '''npm run lint
cd react && npm run lint'''
      }
    }
    stage('Build') {
      steps {
        sh 'cd react && npm run build'
      }
    }
    stage('Staging Deploy') {
      when {
        branch 'staging'
      }
      steps {
        script {
          def packageJson = readJSON file: 'package.json'
          def version = packageJson.version
          VERSION = version
        }
        echo "Deploying staging build to Google Container Registry"
        sh "gcloud builds submit --tag gcr.io/gred-ptddtalak-sb-001-e4372d8c/robotapp:${VERSION}-staging ."
      }
    }
    stage('Production Deploy') {
      when {
        branch 'master'
      }
      steps {
        script {
          def packageJson = readJSON file: 'package.json'
          def version = packageJson.version
          VERSION = version
        }
        echo "Deploying production builds to Google Container Registry"
        sh "gcloud builds submit --tag gcr.io/gred-ptddtalak-sb-001-e4372d8c/robotapp:${VERSION} ."
        sh "gcloud builds submit --tag gcr.io/gred-ptddtalak-sb-001-e4372d8c/robotapp:latest ."
      }
    }
  }
  environment {
    VERSION = null
  }
}