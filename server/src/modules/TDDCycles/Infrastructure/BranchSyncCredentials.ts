import { createHash, timingSafeEqual } from "node:crypto";
import type { RepositoryKey } from "../Domain/TDDHistory";
import { parseBranchSyncRepository } from "../Application/normalizeBranchSyncData";

export class BranchSyncConfigurationError extends Error {
  constructor() {
    super("La sincronización TDD no está configurada");
    this.name = "BranchSyncConfigurationError";
  }
}

const tokenPattern = /^[A-Za-z0-9_-]{32,256}$/;
const hash = (token: string) => createHash("sha256").update(token).digest();

/** One opaque write token per repository; multiple distinct tokens allow rotation. */
export function authenticateBranchSyncToken(
  authorization: string | undefined,
  configuration: () => string | undefined,
): RepositoryKey | null {
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]{32,256})$/i);
  if (!match) return null;
  let credentials: Array<{ token: string; repository: RepositoryKey }>;
  try {
    const parsed: unknown = JSON.parse(configuration() ?? "");
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error();
    const seen = new Set<string>();
    credentials = parsed.map((entry: unknown) => {
      if (
        typeof entry !== "object" ||
        entry === null ||
        !("token" in entry) ||
        !("repository" in entry) ||
        typeof entry.token !== "string" ||
        !tokenPattern.test(entry.token) ||
        seen.has(entry.token)
      )
        throw new Error();
      seen.add(entry.token);
      return {
        token: entry.token,
        repository: parseBranchSyncRepository(entry.repository),
      };
    });
  } catch {
    // Never expose the raw configuration, which contains secrets.
    throw new BranchSyncConfigurationError();
  }
  const suppliedHash = hash(match[1]);
  let repository: RepositoryKey | null = null;
  for (const credential of credentials) {
    if (timingSafeEqual(suppliedHash, hash(credential.token)))
      repository = credential.repository;
  }
  return repository;
}
