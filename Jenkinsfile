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
                            sh(script: 'npm audit --audit-level=critical', returnStatus: true)
                        '''
                    }
                }
                
                // stage('OWASP Dependency Check') {
                //     steps {
                //         dependencyCheck additionalArguments: '''
                //             --purge
                //             --scan './'
                //             --out './'
                //             --format 'ALL'
                //             --prettyPrint
                //         ''', odcInstallation: 'OWASP-DepCheck-10'
                //         dependencyCheckPublisher failedTotalCritical: 1, pattern: 'dependency-check-report.xml', stopBuild: true
                //     }
                // }

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
}