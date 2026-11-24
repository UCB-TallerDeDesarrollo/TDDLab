import express from 'express';
import request from 'supertest';
import { createTDDHistorySyncRouter } from '../../src/routes/TDDHistorySyncRoutes';

const repository = { provider: 'github', owner: 'team', name: 'project' };
const token = 'x'.repeat(40);
const beforeCode = process.env.TDD_SETUP_CODE;
const beforeUrl = process.env.TDD_SYNC_URL;
beforeEach(() => {
  process.env.TDD_SETUP_CODE = 'local-setup-code';
  process.env.TDD_SYNC_URL = 'http://127.0.0.1:3000/api/TDDCycles/sync';
});
afterEach(() => {
  if (beforeCode === undefined) delete process.env.TDD_SETUP_CODE;
  else process.env.TDD_SETUP_CODE = beforeCode;
  if (beforeUrl === undefined) delete process.env.TDD_SYNC_URL;
  else process.env.TDD_SYNC_URL = beforeUrl;
});
function app() {
  const instance = express();
  instance.use('/api/TDDCycles', createTDDHistorySyncRouter({
    credentials: () => JSON.stringify([{ token, repository }]),
  }));
  return instance;
}
it('rejects provisioning without the private local setup code', async () => {
  const response = await request(app()).post('/api/TDDCycles/sync/credentials/cli').send({ repository });
  expect(response.status).toBe(401);
});
it('returns the configured scoped token without issuing new permissions', async () => {
  const response = await request(app()).post('/api/TDDCycles/sync/credentials/cli')
    .set('x-tdd-setup-code', 'local-setup-code').send({ repository });
  expect(response.status).toBe(200);
  expect(response.body.TDD_SYNC_TOKEN).toBe(token);
  expect(response.headers['cache-control']).toBe('no-store');
});
it('does not provision a repository absent from the configured permissions', async () => {
  const response = await request(app()).post('/api/TDDCycles/sync/credentials/cli')
    .set('x-tdd-setup-code', 'local-setup-code').send({ repository: { ...repository, name: 'other' } });
  expect(response.status).toBe(403);
});
it('rejects invalid repository input', async () => {
  const response = await request(app()).post('/api/TDDCycles/sync/credentials/cli')
    .set('x-tdd-setup-code', 'local-setup-code').send({});
  expect(response.status).toBe(400);
});
