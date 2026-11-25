import { createHash, createHmac, timingSafeEqual } from "node:crypto";
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

interface Credential {
  readonly token: string;
  readonly repository: RepositoryKey;
  readonly userIds: readonly number[];
}

function readCredentials(configuration: () => string | undefined): Credential[] {
  try {
    const parsed: unknown = JSON.parse(configuration() ?? "");
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error();
    const seen = new Set<string>();

    return parsed.map((entry: unknown) => {
      if (
        typeof entry !== "object" ||
        entry === null ||
        !("token" in entry) ||
        !("repository" in entry) ||
        typeof entry.token !== "string" ||
        !tokenPattern.test(entry.token) ||
        seen.has(entry.token)
      ) throw new Error();

      const userIds = "userIds" in entry ? entry.userIds : [];
      if (
        !Array.isArray(userIds) ||
        userIds.some(
          (id: unknown) =>
            typeof id !== "number" ||
            !Number.isSafeInteger(id) ||
            id <= 0,
        )
      ) throw new Error();

      seen.add(entry.token);

      return {
        token: entry.token,
        repository: parseBranchSyncRepository(entry.repository),
        userIds,
      };
    });
  } catch {
    throw new BranchSyncConfigurationError();
  }
}

export function authenticateBranchSyncToken(
  authorization: string | undefined,
  configuration: () => string | undefined,
): RepositoryKey | null {
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]{32,256})$/i);
  if (!match) return null;

  const suppliedHash = hash(match[1]);
  let repository: RepositoryKey | null = null;

  for (const credential of readCredentials(configuration)) {
    if (timingSafeEqual(suppliedHash, hash(credential.token))) {
      repository = credential.repository;
    }
  }

  return repository;
}

export function getProvisionedBranchSyncToken(
  userId: number,
  repository: RepositoryKey,
  configuration: () => string | undefined,
): string | undefined {
  return readCredentials(configuration).find(
    (credential) =>
      credential.userIds.includes(userId) &&
      credential.repository.provider === repository.provider &&
      credential.repository.owner === repository.owner &&
      credential.repository.name === repository.name,
  )?.token;
}

function syncMasterSecret(): string {
  const secret = process.env.TDD_SYNC_MASTER_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new BranchSyncConfigurationError();
  }
  return secret;
}

export function deriveBranchSyncToken(repository: RepositoryKey): string {
  const identity = [
    repository.provider,
    repository.owner,
    repository.name,
  ].join(":");

  return createHmac("sha256", syncMasterSecret())
    .update(identity)
    .digest("hex");
}

export function authenticateDerivedBranchSyncToken(
  authorization: string | undefined,
  repository: RepositoryKey,
): boolean {
  const match = authorization?.match(/^Bearer ([A-Za-z0-9_-]{32,256})$/i);
  if (!match) return false;

  return timingSafeEqual(
    hash(match[1]),
    hash(deriveBranchSyncToken(repository)),
  );
}
