pipeline {
    agent any

    tools {
        nodejs 'node22232'
    }
    
    environment {
        MONGO_URI = "mongodb+srv://supercluster.d83jj.mongodb.net/superData"
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
                            trivy filesystem --scanners vuln \
                                --severity CRITICAL \
                                --exit-code 1 \
                                --format template \
                                --template "@/tmp/html.tpl" \
                                -o trivy-report.html \
                                .
                        '''

                    }
                }
            }
        }
        stage('Unit Testing') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'mongo-db-credentials', 
                    passwordVariable: 'MONGO_PASSWORD', 
                    usernameVariable: 'MONGO_USERNAME'
                )]) {
                    sh 'npm test'
                }
                junit allowEmptyResults: true, testResults: 'test-results.xml'
            }

        }
    }
    post {
        always {
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'trivy-report.html',
                reportName: 'Trivy Report'
            ])
        }
    }
}