#!groovy

node {

  // Variables
  def tokens = "${env.JOB_NAME}".tokenize('/')
  def appName = tokens[0]
  def dockerUsername = "${DOCKER_WRI_USERNAME}"
  def imageTag = "${dockerUsername}/${appName}:${env.BRANCH_NAME}.${env.BUILD_NUMBER}"

  currentBuild.result = "SUCCESS"

  def secretKey = UUID.randomUUID().toString().replaceAll('-','')

  checkout scm
  properties([pipelineTriggers([[$class: 'GitHubPushTrigger']])])

  try {

    stage ('Build docker') {
      switch ("${env.BRANCH_NAME}") {
        case "master":
          sh("docker -H :2375 build --build-arg secretKey=${secretKey} -t ${imageTag} .")
          sh("docker -H :2375 build --build-arg secretKey=${secretKey} -t ${dockerUsername}/${appName}:latest .")
          break
        case "staging":
          sh("docker -H :2375 build --build-arg secretKey=${secretKey} -t ${imageTag} .")
          sh("docker -H :2375 build --build-arg secretKey=${secretKey} -t ${dockerUsername}/${appName}:latest .")
          break
        case "develop":
          sh("docker -H :2375 build --build-arg secretKey=${secretKey} -t ${imageTag} .")
          sh("docker -H :2375 build --build-arg secretKey=${secretKey} -t ${dockerUsername}/${appName}:latest .")
          break
        default:
          sh("docker -H :2375 build --build-arg secretKey=${secretKey} -t ${imageTag} .")
          sh("docker -H :2375 build --build-arg secretKey=${secretKey} -t ${dockerUsername}/${appName}:latest .")
      }
    }

    // stage ('Run Tests') {
    //  sh('docker-compose -H :2375 -f docker-compose-test.yml build')
    //  sh('docker-compose -H :2375 -f docker-compose-test.yml run --rm test')
    //  sh('docker-compose -H :2375 -f docker-compose-test.yml stop')
    // }

    stage('Push Docker') {
      withCredentials([usernamePassword(credentialsId: 'WRI Docker Hub', usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD')]) {
        sh("docker -H :2375 login -u ${DOCKER_HUB_USERNAME} -p '${DOCKER_HUB_PASSWORD}'")
        sh("docker -H :2375 push ${imageTag}")
        sh("docker -H :2375 push ${dockerUsername}/${appName}:latest")
        sh("docker -H :2375 rmi ${imageTag}")
      }
    }

    stage ("Deploy Application") {
      sh("echo List kubernetes context")
      sh("kubectl config get-contexts")
      sh("echo Deploying to STAGING cluster")
      // sh("kubectl config use-context ${KUBECTL_CONTEXT_PREFIX}_${CLOUD_PROJECT_NAME}_${CLOUD_PROJECT_ZONE}_${KUBE_PROD_CLUSTER}")
      sh("kubectl config use-context ${KUBECTL_CONTEXT_PREFIX}_${CLOUD_PROJECT_NAME}_${CLOUD_PROJECT_ZONE}_dev")

      switch ("${env.BRANCH_NAME}") {
        // Roll out to staging
        case "staging":
          sh("echo Deploying to STAGING app")
          sh("kubectl apply -f k8s/staging/")
          sh("kubectl set image deployment ${appName}-staging ${appName}-staging=${imageTag} --record --namespace=climate-watch")
          break

        // Roll out to production
        case "develop":
          def userInput = true
          def didTimeout = false

          sh("echo Deploying to PROD app")
          sh("kubectl apply -f k8s/production/")
          sh("kubectl set image deployment ${appName} ${appName}=${imageTag} --record --namespace=climate-watch")

          break

        // Default behavior?
        default:
          echo "Default -> do nothing"
          currentBuild.result = "SUCCESS"
      }
    }
  } catch (err) {
    currentBuild.result = "FAILURE"
    throw err
  }

}
