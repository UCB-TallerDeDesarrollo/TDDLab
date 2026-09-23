import { Request } from 'express';
import { Pool } from 'pg';
import SubmissionController from '../../src/controllers/submissions/submissionsController';
import SubmissionRepository from '../../src/modules/Submissions/Repository/SubmissionsRepository';
import { createResponse } from '../__mocks__/submissions/responseMock';

// Exercise the controller, use cases and SQL repository together. Only PostgreSQL is mocked.
describe('persisted assignment lifecycle', () => {
  const query = jest.fn();
  const release = jest.fn();
  let controller: SubmissionController;
  const started = {
    id: 42, assignmentid: 7, userid: 9, status: 'in progress',
    repository_link: 'https://github.com/student/task',
    start_date: '2026-09-23', end_date: null, comment: null,
  };
  const delivered = { ...started, status: 'delivered', end_date: '2026-09-24', comment: 'Listo' };
  const request = (body = {}, params = {}) => ({ body, params } as Request);
  const readRequest = () => request({}, { assignmentid: '7', userid: '9' });

  beforeEach(() => {
    query.mockReset();
    release.mockClear();
    jest.spyOn(Pool.prototype, 'connect').mockImplementation(() =>
      Promise.resolve({ query, release }) as any
    );
    controller = new SubmissionController(new SubmissionRepository());
  });

  afterEach(() => jest.restoreAllMocks());

  it('returns 404 before starting, and saved states after starting and finishing', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const pendingResponse = createResponse();
    await controller.getSubmissionByAssignmentAndUser(readRequest(), pendingResponse);
    expect(pendingResponse.status).toHaveBeenCalledWith(404);

    query.mockResolvedValueOnce({ rows: [{ exists: true }] })
      .mockResolvedValueOnce({ rows: [{ exists: true }] })
      .mockResolvedValueOnce({ rows: [started] });
    const startResponse = createResponse();
    await controller.CreateSubmission(request(started), startResponse);
    expect(startResponse.status).toHaveBeenCalledWith(201);
    expect(startResponse.json).toHaveBeenCalledWith(started);
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('INSERT INTO submissions'),
      [7, 9, 'in progress', started.repository_link, started.start_date]);

    query.mockResolvedValueOnce({ rows: [started] });
    const reloadResponse = createResponse();
    await controller.getSubmissionByAssignmentAndUser(readRequest(), reloadResponse);
    expect(reloadResponse.json).toHaveBeenCalledWith(started);
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('SELECT * FROM submissions'), [7, 9]);

    query.mockResolvedValueOnce({ rows: [delivered] });
    const finishResponse = createResponse();
    await controller.updateSubmission(request(delivered, { id: '42' }), finishResponse);
    expect(finishResponse.status).toHaveBeenCalledWith(200);
    expect(finishResponse.json).toHaveBeenCalledWith(delivered);
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('UPDATE submissions'),
      ['delivered', delivered.end_date, delivered.comment, 42]);

    query.mockResolvedValueOnce({ rows: [delivered] });
    const finalResponse = createResponse();
    await controller.getSubmissionByAssignmentAndUser(readRequest(), finalResponse);
    expect(finalResponse.json).toHaveBeenCalledWith(delivered);
    expect(release).toHaveBeenCalledTimes(7);
  });

  it('does not confirm completion when saving fails', async () => {
    query.mockRejectedValueOnce(new Error('Database unavailable'));
    const response = createResponse();
    await controller.updateSubmission(request(delivered, { id: '42' }), response);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ error: 'Server error' });
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('distinguishes a read failure from a task that has not started', async () => {
    query.mockRejectedValueOnce(new Error('Database unavailable'));
    const response = createResponse();
    await controller.getSubmissionByAssignmentAndUser(readRequest(), response);
    expect(response.status).toHaveBeenCalledWith(500);
  });
});
