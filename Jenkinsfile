pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    COVERAGE_THRESHOLD = '90'
    COVERAGE_SUMMARY_FILE = 'coverage/coverage-summary.json'
  }

  stages {
    stage('Checkout') {
      steps {
        deleteDir()
        checkout scm
      }
    }

    stage('Instalar dependências') {
      steps {
        sh 'npm ci --no-audit --no-fund'
      }
    }

    stage('Testes unitários e E2E') {
      steps {
        sh 'npm test -- --run'
        sh '''
          set -eu
          export VITE_COVERAGE=true
          export COVERAGE_API_URL="${COVERAGE_API_URL:-http://backend:3001}"
          export VITE_API_PROXY_TARGET="$COVERAGE_API_URL"
          export CYPRESS_BASE_URL=http://127.0.0.1:3000

          api_ready=false
          for attempt in $(seq 1 60); do
            if curl --silent --fail "$COVERAGE_API_URL/" >/dev/null; then
              api_ready=true
              break
            fi
            sleep 2
          done
          if [ "$api_ready" != true ]; then
            echo "A API não respondeu em $COVERAGE_API_URL após 120 segundos."
            exit 1
          fi

          frontend_log=.coverage-vite.log
          npm run dev -w frontend -- --host 0.0.0.0 > "$frontend_log" 2>&1 &
          frontend_pid=$!

          cleanup_frontend() {
            kill "$frontend_pid" 2>/dev/null || true
            wait "$frontend_pid" 2>/dev/null || true
          }
          trap cleanup_frontend EXIT INT TERM

          frontend_ready=false
          for attempt in $(seq 1 60); do
            if curl --silent --fail "$CYPRESS_BASE_URL" >/dev/null; then
              frontend_ready=true
              break
            fi
            if ! kill -0 "$frontend_pid" 2>/dev/null; then
              cat "$frontend_log"
              exit 1
            fi
            sleep 2
          done

          if [ "$frontend_ready" != true ]; then
            cat "$frontend_log"
            echo "O servidor Vite não ficou pronto em 120 segundos."
            exit 1
          fi

          set +e
          npm run cy:run
          cypress_status=$?
          npx nyc report --reporter=text --reporter=lcov --reporter=html --reporter=json-summary
          coverage_report_status=$?
          set -e

          if [ "$cypress_status" -ne 0 ]; then
            exit "$cypress_status"
          fi
          exit "$coverage_report_status"
        '''
      }
    }

    stage('Validar cobertura mínima') {
      steps {
        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          sh '''
node <<'NODE'
const fs = require('node:fs');
const path = process.env.COVERAGE_SUMMARY_FILE;
const threshold = Number(process.env.COVERAGE_THRESHOLD);

if (!fs.existsSync(path)) {
  console.error(`Relatório de cobertura não encontrado: ${path}`);
  console.error('A geração do relatório de cobertura falhou no estágio de testes.');
  process.exit(1);
}

let summary;
try {
  summary = JSON.parse(fs.readFileSync(path, 'utf8'));
} catch (error) {
  console.error(`Relatório de cobertura inválido: ${error.message}`);
  process.exit(1);
}

const lines = summary.total?.lines?.pct;
if (!Number.isFinite(lines)) {
  console.error('O relatório não contém total.lines.pct.');
  process.exit(1);
}

console.log(`Cobertura de linhas: ${lines}% (mínimo: ${threshold}%).`);
if (lines < threshold) {
  console.error('A cobertura mínima exigida não foi atingida.');
  process.exit(1);
}
NODE
          '''
        }
      }
    }

    stage('Build e empacotamento') {
      steps {
        sh '''
          npm run build -w frontend
          mkdir -p artifacts
          tar -czf "artifacts/conduit-${BUILD_NUMBER}.tar.gz" \
            -C "$WORKSPACE" \
            backend frontend/dist package.json package-lock.json
        '''
      }
    }
  }

  post {
    always {
      script {
        archiveArtifacts(
          artifacts: 'artifacts/*.tar.gz,cypress/reports/**,coverage/**',
          allowEmptyArchive: true,
          fingerprint: true
        )

        publishHTML(target: [
          allowMissing: true,
          alwaysLinkToLastBuild: true,
          keepAll: true,
          reportDir: 'cypress/reports',
          reportFiles: 'index.html',
          reportName: 'Relatório Cypress'
        ])
        publishHTML(target: [
          allowMissing: true,
          alwaysLinkToLastBuild: true,
          keepAll: true,
          reportDir: 'coverage/lcov-report',
          reportFiles: 'index.html',
          reportName: 'Cobertura de código (frontend)'
        ])

        env.BUILD_RESULT = currentBuild.currentResult ?: 'UNKNOWN'
        env.GIT_BRANCH = env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'não informada'
        env.GIT_COMMIT = sh(
          returnStdout: true,
          script: 'git rev-parse HEAD 2>/dev/null || echo "não informado"'
        ).trim()
        env.BUILD_DURATION = currentBuild.durationString?.replace(' and counting', '') ?: 'não informada'

        def emailStatus = sh(
          returnStatus: true,
          script: 'python3 /usr/local/bin/send_pipeline_email.py --status "$BUILD_RESULT"'
        )
        if (emailStatus != 0) {
          echo "O script de e-mail terminou com código ${emailStatus}. Confira a configuração SMTP do Jenkins."
          if (currentBuild.currentResult == 'SUCCESS') {
            currentBuild.result = 'UNSTABLE'
          }
        }
      }
    }
  }
}
