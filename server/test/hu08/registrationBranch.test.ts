import { RegisterTestResultUseCase } from "../../src/modules/TDDCycles/Application/registerTestResultUseCase";
import { FakeDBJobsRepository } from "../../src/modules/TDDCycles/Repositories/FakeDBJobsRepository";
describe("HU08 rama e identidad en el registro", () => {
  const result = { sha: "hu08-branch", owner: "hu08", reponame: "tests", conclusion: "success", branch: "feature/hu08" };
  it("conserva la rama y la actualiza ante un duplicado sin crear filas", async () => {
    const repository = new FakeDBJobsRepository();
    const useCase = new RegisterTestResultUseCase(repository);
    expect(await useCase.execute(result)).toBe("created");
    expect(await repository.getJobs(result.owner, result.reponame)).toEqual([expect.objectContaining(result)]);
    expect(await useCase.execute({ ...result, branch: "other/branch" })).toBe("duplicate");
    expect(await repository.getJobs(result.owner, result.reponame)).toEqual([expect.objectContaining({ ...result, branch: "other/branch" })]);
  });
  it.each([null, 123, "", "../main", "feature//wrong"])("rechaza rama inválida %j", async branch => {
    await expect(new RegisterTestResultUseCase(new FakeDBJobsRepository()).execute({ ...result, branch })).rejects.toMatchObject({ field: "branch" });
  });
  it("no devuelve jobs de otro propietario o repositorio", async () => {
    const repository = new FakeDBJobsRepository();
    await repository.register(result);
    expect(await repository.getJobs("other", result.reponame)).toEqual([]);
    expect(await repository.repositoryExists("other", result.reponame)).toBe(false);
    const job = (await repository.getJobs(result.owner, result.reponame))[0];
    expect(await repository.jobExists("other", result.reponame, job.id!)).toBe(false);
  });
});
