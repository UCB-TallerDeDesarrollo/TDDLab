const { defineConfig } = require('cypress');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { Pool } = require('../server/node_modules/pg');
const root = path.resolve(__dirname, '..');

module.exports = defineConfig({
  video: false,
  screenshotsFolder: '../docs/hu08/evidence/screenshots',
  viewportWidth: 1440,
  viewportHeight: 1100,
  e2e: {
    baseUrl: 'http://127.0.0.1:5173',
    specPattern: 'test/cypress/hu08/**/*.cy.js',
    supportFile: false,
    setupNodeEvents(on) {
      on('after:run', results => {
        fs.writeFileSync(path.join(root, 'docs/hu08/evidence/cypress-results.json'), JSON.stringify({
          browser: results.browserName, browserVersion: results.browserVersion,
          totalTests: results.totalTests, totalPassed: results.totalPassed,
          totalFailed: results.totalFailed, startedAt: results.startedTestsAt,
          endedAt: results.endedTestsAt,
          runs: results.runs?.map(run => ({ spec: run.spec.relative, stats: run.stats, tests: run.tests.map(test => ({ title: test.title, state: test.state, error: test.displayError })) })),
        }, null, 2));
      });
      on('task', {
        async databaseSnapshot() {
          if (!process.env.TDDLAB_TEST_DATABASE_URL) throw new Error('TDDLAB_TEST_DATABASE_URL requerida');
          const pool = new Pool({ connectionString: process.env.TDDLAB_TEST_DATABASE_URL, ssl: false });
          try {
            const result = await pool.query("SELECT commit_history, tdd_log FROM tdd_result_snapshots WHERE owner='hu08' AND reponame='migration-validation' AND branch='main'");
            const jobs = await pool.query("SELECT sha, owner, reponame, conclusion, branch FROM jobstable WHERE owner='hu08' AND reponame='migration-validation' ORDER BY sha");
            const evidence = { snapshots: result.rows, jobs: jobs.rows };
            fs.writeFileSync(path.join(root, 'docs/hu08/evidence/database-select.json'), JSON.stringify(evidence, null, 2));
            return evidence;
          } finally { await pool.end(); }
        },
        executeProbeTests() {
          const summary = [];
          for (const [name, pattern] of [['passed', 'passed.test.js'], ['failed', 'failed.test.js'], ['without-tests', 'no-tests-match']]) {
            const output = path.join(root, `.hu08-work/probe-${name}.json`);
            const probeEnv = { ...process.env };
            delete probeEnv.NODE_OPTIONS;
            delete probeEnv.ELECTRON_RUN_AS_NODE;
            const run = spawnSync(process.execPath, [path.join(root, 'server/node_modules/jest/bin/jest.js'), '--config', path.join(root, 'docs/hu08/fixtures/probe-project/jest.config.cjs'), '--runInBand', '--passWithNoTests', '--testPathPattern', pattern, '--json', '--outputFile', output], { cwd: root, encoding: 'utf8', env: probeEnv, windowsHide: true });
            if (run.error) throw run.error;
            const withoutTests = name === 'without-tests' && run.status === 0 && /No tests found/.test(run.stdout + run.stderr);
            if (!fs.existsSync(output) && !withoutTests) throw new Error(run.stderr || run.stdout);
            const result = withoutTests ? { numPassedTests: 0, numFailedTests: 0, numTotalTests: 0 } : JSON.parse(fs.readFileSync(output, 'utf8'));
            summary.push({ name, exitCode: run.status, passed: result.numPassedTests, failed: result.numFailedTests, total: result.numTotalTests });
          }
          fs.writeFileSync(path.join(root, 'docs/hu08/evidence/probe-test-results.json'), JSON.stringify(summary, null, 2));
          return summary;
        },
      });
    },
  },
});
