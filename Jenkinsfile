
// 커밋메시지 변수로 저장
def get_commit_msg(){
    script {
        return sh(script : "git show -s --format=%B ${env.GIT_COMMIT}", returnStdout: true).trim().replace (' ', '   ')
    }
}

// 전역변수 설정
//dockerImage는 비워두기
//registryCredential은 ecr에 접근할 젠킨스내 secret
pipeline {
    environment {
        registry = ""
        imagename = 'stream-file-upload'
        registryCredential = ''
        slackchannel = ''
        projectrepo = ''
        deployrepo = ''
        deployreponame = ''
        deployrepoappname = ''
        COMMIT_MSG = get_commit_msg()
        dockerImage = ''
    }
  
  agent any
  stages {
    stage('Cloning Git') {
      steps {
        slackSend (channel: slackchannel, color: '#00FF00', message: "${env.JOB_NAME}앱의 CI 과정이 시작되었습니다 \n Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})\n 내용 ${COMMIT_MSG}")
        git([url: projectrepo, branch: 'develop', credentialsId: 'sshkey'])
          }
            }
    stage('Building Image') {
      steps{
        script {
          dockerImage = docker.build "$registry/$imagename:$BUILD_NUMBER"
    }
        }
            }
    stage('Testing') {
        steps{
         script {
            dockerImage.inside {
            sh 'node --version'
            }
            }
        }
    }
stage('Push Image') {
    steps{
        script {
        docker.withRegistry( "https://$registry", registryCredential ) {
        dockerImage.push()
    }
        }
            }
                }
    stage('Cleaning Up') {
    steps{
    sh "docker rmi $registry/$imagename:$BUILD_NUMBER"
                    }
                }
        stage('Deploy') {
        steps {
            dir(deployreponame) {
            git([url: deployrepo, branch: 'master', credentialsId: 'sshkey'])
        }
            dir (deployreponame) {
                    sh "sed -i 's/$imagename:.*\$/$imagename:${env.BUILD_NUMBER}/g' $deployrepoappname/deployment.yaml"
                    sh "git add $deployrepoappname/deployment.yaml"
                    sh "git commit -m 'updated the image tag to ${env.BUILD_NUMBER}'"
                    sh 'git push --set-upstream origin master'
                    }
            }
        }   
    }     
    post {
        always {
            echo 'One way or another, I have finished'
        }
        success {
            slackSend (channel: slackchannel, color: '#00FF00', message: "빌드 완료 \n ${env.JOB_NAME}앱의 CI 과정이 성공적으로 끝났습니다 \n Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }
        unstable {
            echo 'I am unstable 11hook tst/'
        }
        failure {
            deleteDir()
            slackSend (channel: slackchannel, color: '#00FF00', message: "빌드가 실패하였습니다 \n ${env.JOB_NAME}앱의 젠킨스 콘솔을 확인해주세요 \n Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
            slackSend (channel: '#devops-alarm', color: '#00FF00', message: "빌드가 실패하였습니다 \n ${env.JOB_NAME}앱의 젠킨스 콘솔을 확인해주세요 \n Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }
        changed {
            echo 'Things were different before...'
        }
    }
}
