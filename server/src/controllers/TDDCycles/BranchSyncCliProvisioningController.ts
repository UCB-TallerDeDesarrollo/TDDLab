import type { RequestHandler } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import { parseBranchSyncRepository } from '../../modules/TDDCycles/Application/normalizeBranchSyncData';
import { authenticateBranchSyncToken } from '../../modules/TDDCycles/Infrastructure/BranchSyncCredentials';
import { InvalidTDDHistoryBatchError } from '../../modules/TDDCycles/Domain/TDDHistory';

const hash = (value: string) => createHash('sha256').update(value).digest();

// Compatibilidad del CLI local de BL-06: entrega solo permisos ya configurados.
export function provisionBranchSyncCli(configuration: () => string | undefined): RequestHandler {
  return (req, res) => {
    res.set('Cache-Control', 'no-store');
    const expected = process.env.TDD_SETUP_CODE;
    const provided = req.get('x-tdd-setup-code');
    if (!expected || !provided || !timingSafeEqual(hash(expected), hash(provided))) {
      res.status(401).json({ code: 'UNAUTHORIZED' });
      return;
    }
    if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress ?? '')) {
      res.status(403).json({ code: 'LOCAL_SETUP_ONLY' });
      return;
    }
    try {
      const repository = parseBranchSyncRepository(req.body?.repository);
      const entries: unknown = JSON.parse(configuration() ?? '');
      if (!Array.isArray(entries)) throw new Error('Invalid configuration');
      const token = entries.find(entry => {
        const permitted = authenticateBranchSyncToken(`Bearer ${entry.token}`, configuration);
        return permitted?.provider === repository.provider && permitted.owner === repository.owner && permitted.name === repository.name;
      })?.token;
      if (!token) {
        res.status(403).json({ code: 'REPOSITORY_FORBIDDEN' });
        return;
      }
      const url = new URL(process.env.TDD_SYNC_URL ?? '');
      const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
      if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
          url.username || url.password || url.search || url.hash) throw new Error('Invalid URL');
      res.json({ TDD_SYNC_URL: url.href, TDD_SYNC_TOKEN: token });
    } catch (error) {
      res.status(error instanceof InvalidTDDHistoryBatchError ? 400 : 503)
        .json({ code: error instanceof InvalidTDDHistoryBatchError ? 'INVALID_REPOSITORY' : 'SYNC_UNAVAILABLE' });
    }
  };
}
