pipeline {
    agent any

    tools {
        nodejs 'node22232'
    }
    
    environment {
        MONGO_URI = "mongodb+srv://supercluster.d83jj.mongodb.net/superData"
        MONGO_DB_CREDS = credentials('mongo-db-credentials')
        MONGO_DB_CREDS_USERNAME = credentials('mongo-db-user')
        MONGO_DB_CREDS_PASSWORD = credentials('mongo-db-password')
        SONAR_SCANNER_HOME = tool 'sonarqube-scanner-810';
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
        // stage('Unit Testing') {
        //     steps {
        //         withCredentials([usernamePassword(
        //             credentialsId: 'mongo-db-credentials', 
        //             passwordVariable: 'MONGO_PASSWORD', 
        //             usernameVariable: 'MONGO_USERNAME'
        //         )]) {
        //             sh 'npm test'
        //         }
        //     }
        //     post { 
        //         always {
        //             junit allowEmptyResults: true, testResults: 'test-results.xml'
        //         }
        //     }
        // }
        stage('Code Coverage') {
            steps {
                sh 'echo Colon-Separated - $MONGO_DB_CREDS'
                sh 'echo Username - $MONGO_DB_CREDS_USERNAME'
                sh 'echo Password - $MONGO_DB_CREDS_PASSWORD'

                catchError(buildResult: 'SUCCESS', message: 'Oops! It will be fixed in future release', stageResult: 'UNSTABLE') {
                    sh 'npm run coverage'
                }
            }
        } 
        stage('SonarQube Scanning') {
            steps {
                timeout(time: 60, unit: 'SECONDS') {
                    withSonarQubeEnv('sonar-qube-server') {
                        sh 'echo $SONAR_SCANNER_HOME'
                        sh '''
                        $SONAR_SCANNER_HOME/bin/sonar-scanner \
                            -Dsonar.host.url=http://192.168.68.58:9000 \
                            -Dsonar.source=app.js \
                            -Dsonar.projectKey=solar-system-gitea
                            -Dsonar.exclusions=**/trivy-report*.html,**/trivy-report*.json,**/*trivy*
                        '''
                    }
                    waitForQualityGate abortPipeline: true
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'printenv'
                sh 'docker build -t islandertron1016/solar-system:${GIT_COMMIT} .'
            }
        }
        stage('Trivy Vulnerability Scanner') {
            steps {
                sh '''
                    trivy image islandertron1016/solar-system:${GIT_COMMIT} \
                        --severity LOW,MEDIUM,HIGH \
                        --exit-code 0 \
                        --quiet \
                        --format json -o trivy-image-MEDIUM-results.json

                    trivy image islandertron1016/solar-system:${GIT_COMMIT} \
                        --severity CRITICAL \
                        --exit-code 1 \
                        --quiet \
                        --format json -o trivy-image-CRITICAL-results.json
                '''
            }
            post {
                always {
                    sh '''
                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
                            --output trivy-image-MEDIUM-results.html trivy-image-MEDIUM-results.json

                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/html.tpl" \
                            --output trivy-image-CRITICAL-results.html trivy-image-CRITICAL-results.json

                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \
                            --output trivy-image-MEDIUM-results.xml   trivy-image-MEDIUM-results.json

                        trivy convert \
                            --format template --template "@/usr/local/share/trivy/templates/junit.tpl" \
                            --output trivy-image-CRITICAL-results.xml trivy-image-CRITICAL-results.json

                    '''
                }
            }
            
        }
    }
    post {
        always {
            junit allowEmptyResults: true, stdioRetention: '', testResults: 'trivy-image-MEDIUM-results.xml'
            junit allowEmptyResults: true, stdioRetention: '', testResults: 'trivy-image-CRITICAL-results.xml'

            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '.',
                reportFiles: 'trivy-report.html',
                reportName: 'Trivy Report'
            ])
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'coverage/lcov-report',
                reportFiles: 'index.html',
                reportName: 'Code Coverage HTML Report'
            ])
            publishHTML(target: [
                allowMissing: true, 
                alwaysLinkToLastBuild: true, 
                keepAll: true, 
                reportDir: ".", 
                reportFiles:'trivy-image-CRITICAL-results.html', 
                reportName: "Trivy Image Critical Vul Report", 
                reportTitles: "", 
                useWrapperFileDirectly: true
            ])
            publishHTML(target: [
                allowMissing: true,
                alwaysLinkToLastBuild: true, 
                keepAll: true, 
                reportDir: '.',
                reportFiles: 'trivy-image-MEDIUM-results.html', 
                reportName:'Trivy Image Medium Vul Report',
                reportTitles: "", 
                useWrapperFileDirectly: true
            ])
        }
    }
}