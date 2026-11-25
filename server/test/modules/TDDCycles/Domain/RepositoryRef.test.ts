import { isValidBranch } from "../../../../src/modules/TDDCycles/Domain/RepositoryRef";

describe("RepositoryRef branch validation", () => {
  it("accepts branch names with slash", () => {
    expect(isValidBranch("feature/restador")).toBe(true);
  });

  it.each(["", "/feature", "feature/", "feature//x", "feature..x", "feature x", "feature~x", "feature.lock", "feature@{x"]) (
    "rejects invalid branch %s",
    (branch) => expect(isValidBranch(branch)).toBe(false)
  );
});
