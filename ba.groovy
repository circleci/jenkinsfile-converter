@Library( 'global-library' ) _

pipeline {
  agent none
  options {
    skipDefaultCheckout()
    // ansiColor( 'xterm' )
    buildDiscarder( logRotator(numToKeepStr: '10') )
    timeout( time: 30, unit: 'MINUTES' )
    timestamps()
  }
  environment {
    SLACK_CHANNEL = '#cicd-notify'
    SLACK_API_TOKEN = credentials('swet-space-slack-api-app-token')
    PRODUCT_NAME = 'sample-unity-app'
  }
  stages {

    stage( "Export Project" ) {
      agent {
        label "Android-App && Unity-${params.UNITY_VERSION}"
      }
      environment {
        STAGE_DIR = 'export-stage'
        EXECUTE_METHOD = 'BatchBuild.AndroidBuild'
        EXECUTE_DEBUG_METHOD = 'BatchBuild.AndroidDebugBuild'
        EXPORT_PATH = "${params.EXPORT_PATH}"
        UNITY = "/Applications/Unity/Hub/Editor/${params.UNITY_VERSION}/Unity.app/Contents/MacOS/Unity"
      }
      steps {
        script {
          // Select execute method
          if ( DEBUG_FLG.toBoolean() ) {
            env.EXEC_METHOD = EXECUTE_DEBUG_METHOD
          } else {
            env.EXEC_METHOD = EXECUTE_METHOD
          }
        }

        dir( STAGE_DIR ) {
          // Delete previous export artifacts
          sh 'rm -rf ${EXPORT_PATH}/*'

          checkout scm

          // Export Android project
          sh '''
            ${UNITY} -quit \
                     -batchmode \
                     -projectPath ${PWD} \
                     -buildTarget android \
                     -logFile '/dev/stdout' \
                     -executeMethod ${EXEC_METHOD}
            '''
        }
      }
      post {
        success {
          dir( STAGE_DIR ) {
            // Zip export project
            sh 'zip -r ${EXPORT_PATH}.zip ${EXPORT_PATH}'

            // Stash export project (Use Next Stage)
            stash name: 'project', includes: "${EXPORT_PATH}.zip"

            // Archive artifacts： unity symbols
            uploadFileToGCS( "${EXPORT_PATH}*symbols.zip" )
          }
        }
        failure {
          script {
            // Notification message when failure
            env.ERROR_STAGE="ErrorStage: Export Project."
          }
        }
      }
    }
    stage( "Android Build" ) {
      agent {
        label "ubuntu"
      }
      environment {
        STAGE_DIR = 'build-stage'
        EXPORT_PATH = "${params.EXPORT_PATH}"
        RESULT_PATH = "${WORKSPACE}/${STAGE_DIR}/${params.EXPORT_PATH}/${PRODUCT_NAME}/result"
        RESULT_DIR = "./result"
        RESULT_ZIP_FILE = "result.zip"
        JAVA_OPTS = "-Xmx1536m"
        GRADLE_OPTS = '-Dorg.gradle.jvmargs="-Xmx1536m"'
      }
      steps {
        dir( STAGE_DIR ) {
          checkout scm
          
          // Unstash "Export Project" stage stash file
          unstash 'project'

          // Unzip android project
          sh 'unzip -o ${EXPORT_PATH}.zip'
          

          sh '''
            cd "${EXPORT_PATH}/${PRODUCT_NAME}"

            chmod +x ./local.properties
            rm -rf ./local.properties
            echo ndk.dir=${ANDROID_NDK_HOME} >> ./local.properties
            echo sdk.dir=${ANDROID_SDK_HOME} >> ./local.properties
            
            ../../android_project/gradlew clean assembleRelease
          '''

          // for artifacts
          sh '''
            rm -rf ${RESULT_DIR}
            mkdir -p ${RESULT_DIR}
            mv ${EXPORT_PATH}/${PRODUCT_NAME}/build/outputs/apk/*/*.apk ${RESULT_DIR}
            mv ${EXPORT_PATH}/${PRODUCT_NAME}/build/intermediates/jniLibs/* ${RESULT_DIR}
            zip -r ${RESULT_ZIP_FILE} ${RESULT_DIR}
          '''
        }
      }
      post {
        always {
          dir( STAGE_DIR ) {
            // Archive artifacts： android project（ unstash file ）
            uploadFileToGCS( "${EXPORT_PATH}.zip" )
          }
        }
        success {
          dir( STAGE_DIR ) {
            // Archive artifacts： apk、symbols
            uploadFileToGCS( RESULT_ZIP_FILE )
          }
        }
        failure {
          script {
            // Notification message when failure
            env.ERROR_STAGE="ErrorStage: Android Build."
          }
        }
        cleanup {
          dir( STAGE_DIR ) {
             // Delete current export and build artifacts
            sh 'rm -rf ${EXPORT_PATH}/*'
            sh 'rm -rf ${RESULT_ZIP_FILE}'
          }
        }
      }
    }
  }
  post {
    always {
      script {
        // Set build description
        currentBuild.description = "<ul><li>Branch: ${params.BRANCH}</li><li>Unity: ${params.UNITY_VERSION}</li><li><a href=\"${BUILD_URL}/timestamps/?time=HH:mm:ss&appendLog\">Full Console Log</a></li></ul>"
      }
    }
    success {
      // Notification success to slack
      sendSlack( 'good', "Successful: ${env.JOB_NAME} - #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)" )
    }
    aborted {
      script {
        // FAILURE is set, so failure will be executed unless ABORTED is set
        currentBuild.result = 'ABORTED'
      }
      // Notification aborted to slack
      sendSlack( '#BFBFBF', "Aborted: ${env.JOB_NAME} - #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>)" )
    }
    failure {
      // Notification failure to slack
      sendSlack( 'danger', "Failure: ${env.JOB_NAME} - #${env.BUILD_NUMBER} (<${env.BUILD_URL}|Open>) ${env.ERROR_STAGE}" )
    }
  }
}

// shared library を利用して GCS へ指定したファイルをアップロードする
def uploadFileToGCS( filePattern ) {
  def artifactsBucketName = getArtifactsBucketName()
  def gcsCredentialId = 'swet-gcp-service-account'

  archiveArtifactsGCS( bucket: artifactsBucketName, credentialsId: gcsCredentialId, pattern: filePattern )
}

// upload 先のバケット名を取得
// UPLOAD_GCS_BUCKET の指定がなければ一時保存用 xxxx-jenkins-artifacts-temporary
// UPLOAD_GCS_BUCKET ビルドパラメータを設定することでアップロード先をデフォルトから変更可能
def getArtifactsBucketName() {
  def artifactsBucketName = 'swet-jenkins-artifacts-temporary'

  // アップロード先が指定されている場合（指定されていない場合 params.UPLOAD_GCS_BUCKET=null）
  if ( params.UPLOAD_GCS_BUCKET ) {
    artifactsBucketName = params.UPLOAD_GCS_BUCKET
  }

  return artifactsBucketName
}

// color, 通知メッセージを指定して、slack plugin を利用して通知
// ユーザがトリガーしている場合はそのユーザにメンション
def sendSlack( color, message ) {
  def mentions = ''
  def causes = currentBuild.getBuildCauses('hudson.model.Cause$UserIdCause')

  if ( causes.size() > 0 ) {
    mentions = getSlackUsersMentionString( userEmails: [ causes[0].userId ], slackAPIToken: SLACK_API_TOKEN ) + '\n'
  } else {
    // triggered by system
    // 失敗時はユーザグループにメンション
    if ( currentBuild.currentResult != "SUCCESS" ) {
      mentions = "<!subteam^SDTPUG09L|CI/CDなguys>" + '\n'
    }
  }

  // 通知先ユーザを ID 文字列を検索して付与
  message = mentions + message
  slackSend( channel: SLACK_CHANNEL, color: color, message: message )
}

