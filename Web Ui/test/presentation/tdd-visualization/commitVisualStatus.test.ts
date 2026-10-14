import { CommitDataObject } from "../../../src/modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { getCommitVisualDescriptor } from "../../../src/presentation/tdd-visualization/components/commitVisualStatus";

const baseCommit: CommitDataObject = {
  html_url: "https://github.com/example/repo/commit/abc",
  sha: "abc",
  stats: { total: 4, additions: 3, deletions: 1 },
  commit: {
    date: new Date("2026-01-01T00:00:00.000Z"),
    message: "feat: add validation",
    url: "https://api.github.com/repos/example/repo/commits/abc",
    comment_count: 0,
  },
  coverage: 100,
  test_count: 5,
  conclusion: "success",
};

describe("getCommitVisualDescriptor", () => {
  it("uses a triangle and explicit text for failed tests", () => {
    const descriptor = getCommitVisualDescriptor({
      ...baseCommit,
      coverage: 40,
      test_count: 2,
      conclusion: "failure",
    });

    expect(descriptor.status).toBe("failed");
    expect(descriptor.pointStyle).toBe("triangle");
    expect(descriptor.tooltipStatus).toBe("Estado: Pruebas fallidas (40% de cobertura; 2 pruebas)");
  });

  it("treats a commit without executed tests as failed", () => {
    const descriptor = getCommitVisualDescriptor({
      ...baseCommit,
      test_count: 0,
      conclusion: "success",
    });

    expect(descriptor.status).toBe("failed");
    expect(descriptor.pointStyle).toBe("triangle");
    expect(descriptor.tooltipStatus).toBe("Estado: Pruebas fallidas (100% de cobertura; 0 pruebas)");
  });

  it("uses a circle for successful tests", () => {
    const descriptor = getCommitVisualDescriptor(baseCommit);

    expect(descriptor.status).toBe("success");
    expect(descriptor.pointStyle).toBe("circle");
    expect(descriptor.tooltipStatus).toBe("Estado: Pruebas pasadas (100% de cobertura; 5 pruebas)");
  });

  it("adds a secondary outline to a successful refactor", () => {
    const descriptor = getCommitVisualDescriptor({
      ...baseCommit,
      commit: { ...baseCommit.commit, message: "refactor: simplify validator" },
    });

    expect(descriptor.status).toBe("refactor");
    expect(descriptor.pointStyle).toBe("circle");
    expect(descriptor.borderWidth).toBe(4);
    expect(descriptor.tooltipStatus).toContain("Estado: Refactor (pruebas pasadas)");
  });
});
