import { GetTestResultsUseCase } from "../../../../src/modules/TDDCycles/Application/getTestResultsUseCase";
import { FakeDBJobsRepository } from "../../../../src/modules/TDDCycles/Repositories/FakeDBJobsRepository";
import { FakeGithubRepository } from "../../../../src/modules/TDDCycles/Repositories/FakeGithubRepository";

describe("GetTestResultsUseCase con repositorio falso", () => {
  it("devuelve los commits exitoso, fallido y sin pruebas sin modificar el caso de uso", async () => {
    const repository = new FakeDBJobsRepository();
    const useCase = new GetTestResultsUseCase(repository, new FakeGithubRepository());

    await expect(useCase.execute("demo", "tests")).resolves.toEqual([
      expect.objectContaining({ sha: "commit-all-tests-passed", conclusion: "success" }),
      expect.objectContaining({ sha: "commit-tests-failed", conclusion: "failure" }),
      expect.objectContaining({ sha: "commit-without-tests", conclusion: "skipped" }),
    ]);
  });
});
