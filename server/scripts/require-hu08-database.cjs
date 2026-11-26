const { spawnSync } = require('node:child_process');
if (!process.env.TDDLAB_TEST_DATABASE_URL) {
  console.error('Configure TDDLAB_TEST_DATABASE_URL con una base PostgreSQL exclusiva para pruebas.');
  process.exit(1);
}
const result = spawnSync(process.execPath, [require.resolve('jest/bin/jest'), '--runInBand', 'test/hu08', ...process.argv.slice(2)], { stdio: 'inherit', env: process.env });
process.exit(result.status ?? 1);
