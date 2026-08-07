pipeline {
  agent any

  tools {
    nodejs 'node22232'
  }

  stages {
    stage ('VM Node Version') {
      steps {
        sh '''
          node -v
          npm -v
          echo "hello world"
        '''
      }
    }
  }
}