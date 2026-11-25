export interface RepositoryRef {
  owner: string;
  repo: string;
  branch?: string;
}

export interface BranchSummary {
  name: string;
  ref: string;
  headSha: string;
  isDefault: boolean;
}

export interface BranchFileSnapshot {
  status: "ok" | "missing";
  records: unknown[];
}

export interface BranchSnapshot {
  ref: string;
  resolvedSha: string;
  branch: string;
  files: {
    tddLog: BranchFileSnapshot;
    commitHistory: BranchFileSnapshot;
  };
}

export function isValidBranch(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 255) return false;
  return !(
    value.startsWith("/") ||
    value.endsWith("/") ||
    value.endsWith(".") ||
    value.endsWith(".lock") ||
    value.includes("..") ||
    value.includes("//") ||
    value.includes("@{") ||
    /[\u0000-\u001f ~^:?*[\\]/.test(value) ||
    value.startsWith("-")
  );
}
