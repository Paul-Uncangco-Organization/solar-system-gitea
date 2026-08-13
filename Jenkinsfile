pipeline {
  agent any

  tools {
    nodejs 'node22232'
  }

    stages {
        stage('Installing Dependencies') {
            steps {
                sh 'npm install --no-audit'
            }
        }
        
        stage('Dependency Scanning') {
            parallel {
                stage('NPM Dependency Audit') {
                    steps {
                        sh '''
                            npm audit --audit-level=critical
                        '''
                    }
                }

                stage('Trivy FS Scan') {
                    steps {
                        sh '''
                            # Scan filesystem (node_modules + lock files)
                            /tmp/trivy filesystem --scanners vuln \
                                --severity CRITICAL \
                                --exit-code 1 \
                                --format table \
                                .
                        '''
                    }
                }
            }
        }
    }
//     post {
//       always {
//         cleanWs()
//       }
//    }
}