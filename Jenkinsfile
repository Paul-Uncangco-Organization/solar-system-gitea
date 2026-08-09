pipeline {
  agent any

  tools {
    nodejs 'node22232'
  }

  stages {
    stage ('Installing Dependencies') {
      steps {
        sh 'npm install --no-audit'
      }
    }
     stage ('NPM Dependency Audit') {
      steps {
        sh '''
          npm install --audit-level=critical
          echo $? 
        '''
      }
    }
  }
}