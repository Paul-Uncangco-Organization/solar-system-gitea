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
                            echo $?
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
                            # Install Trivy (or use a pre-baked agent image)
                            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /tmp

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