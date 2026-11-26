import { FakeDBJobsRepository } from "../../../../src/modules/TDDCycles/Repositories/FakeDBJobsRepository";
import { RegisterTestResultUseCase } from "../../../../src/modules/TDDCycles/Application/registerTestResultUseCase";

describe("FakeDBJobsRepository: registro de resultados", () => {
  let repository: FakeDBJobsRepository;
  const result = { sha: "new-sha", owner: "demo", reponame: "tests", conclusion: "success" };

  beforeEach(() => { repository = new FakeDBJobsRepository(); });

  it("conserva los tres resultados de demostración", async () => {
    await expect(repository.getJobs("demo", "tests")).resolves.toEqual([
      { id: 1001, sha: "commit-all-tests-passed", owner: "demo", reponame: "tests", conclusion: "success" },
      { id: 1002, sha: "commit-tests-failed", owner: "demo", reponame: "tests", conclusion: "failure" },
      { id: 1003, sha: "commit-without-tests", owner: "demo", reponame: "tests", conclusion: "skipped" },
    ]);
  });

  it("devuelve created al registrar un resultado nuevo", async () => {
    await expect(repository.register(result)).resolves.toBe("created");
  });

  it("permite consultar el resultado registrado mediante getJobs y findJobByCommit", async () => {
    await repository.register(result);
    expect(await repository.getJobs(result.owner, result.reponame)).toContainEqual(expect.objectContaining(result));
    await expect(repository.findJobByCommit(result.sha, result.owner, result.reponame)).resolves.toEqual(expect.objectContaining(result));
  });

  it("devuelve duplicate al registrar dos veces el mismo resultado", async () => {
    await repository.register(result);
    await expect(repository.register(result)).resolves.toBe("duplicate");
  });

  it("no aumenta la cantidad de registros ante un duplicado", async () => {
    await repository.register(result);
    const before = await repository.getJobs(result.owner, result.reponame);
    await repository.register(result);
    expect(await repository.getJobs(result.owner, result.reponame)).toHaveLength(before.length);
  });

  it("devuelve conflict para la misma identidad con otra conclusión", async () => {
    await repository.register(result);
    await expect(repository.register({ ...result, conclusion: "failure" })).resolves.toBe("conflict");
  });

  it("un conflicto conserva la conclusión y la cantidad de registros", async () => {
    await repository.register(result);
    const before = await repository.getJobs(result.owner, result.reponame);
    await repository.register({ ...result, conclusion: "failure" });
    const after = await repository.getJobs(result.owner, result.reponame);
    expect(after).toHaveLength(before.length);
    expect(await repository.findJobByCommit(result.sha, result.owner, result.reponame)).toEqual(expect.objectContaining(result));
  });

  it("distingue el mismo SHA en repositorios diferentes", async () => {
    const other = { ...result, reponame: "other", conclusion: "failure" };
    expect(await repository.register(result)).toBe("created");
    expect(await repository.register(other)).toBe("created");
    await expect(repository.findJobByCommit(result.sha, result.owner, result.reponame)).resolves.toEqual(expect.objectContaining(result));
    await expect(repository.findJobByCommit(other.sha, other.owner, other.reponame)).resolves.toEqual(expect.objectContaining(other));
  });

  it("distingue el mismo SHA para propietarios diferentes", async () => {
    const other = { ...result, owner: "other", conclusion: "failure" };
    expect(await repository.register(result)).toBe("created");
    expect(await repository.register(other)).toBe("created");
    await expect(repository.findJobByCommit(result.sha, result.owner, result.reponame)).resolves.toEqual(expect.objectContaining(result));
    await expect(repository.findJobByCommit(other.sha, other.owner, other.reponame)).resolves.toEqual(expect.objectContaining(other));
  });

  it("registra solicitudes idénticas concurrentes una sola vez", async () => {
    const outcomes = await Promise.all([repository.register(result), repository.register(result)]);
    expect(outcomes.sort()).toEqual(["created", "duplicate"]);
    expect(await repository.getJobs(result.owner, result.reponame)).toHaveLength(4);
  });

  it("resuelve conclusiones concurrentes como creación y conflicto, conservando la ganadora", async () => {
    const competing = { ...result, conclusion: "failure" };
    const outcomes = await Promise.all([repository.register(result), repository.register(competing)]);
    expect([...outcomes].sort()).toEqual(["conflict", "created"]);
    const winner = outcomes[0] === "created" ? result : competing;
    await expect(repository.findJobByCommit(result.sha, result.owner, result.reponame)).resolves.toEqual(expect.objectContaining(winner));
    expect(await repository.getJobs(result.owner, result.reponame)).toHaveLength(4);
  });

  it("asigna identificadores sin colisiones", async () => {
    await repository.register(result);
    await repository.register({ ...result, sha: "another-sha" });
    const jobs = await repository.getJobs(result.owner, result.reponame);
    const ids = jobs.map((job) => job.id);
    expect(ids.every((id) => typeof id === "number")).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("mantiene almacenamiento independiente por instancia", async () => {
    const other = new FakeDBJobsRepository();
    await repository.register(result);
    await expect(other.findJobByCommit(result.sha, result.owner, result.reponame)).resolves.toBeNull();
    expect(await other.getJobs(result.owner, result.reponame)).toHaveLength(3);
  });

  it("devuelve copias desde getJobs", async () => {
    const jobs = await repository.getJobs("demo", "tests");
    jobs[0].conclusion = "altered";
    expect((await repository.getJobs("demo", "tests"))[0].conclusion).toBe("success");
  });

  it("devuelve una copia desde findJobByCommit", async () => {
    const job = await repository.findJobByCommit("commit-all-tests-passed", "demo", "tests");
    if (!job) throw new Error("Falta el resultado de demostración");
    job.conclusion = "altered";
    expect((await repository.findJobByCommit("commit-all-tests-passed", "demo", "tests"))?.conclusion).toBe("success");
  });

  it("no comparte el objeto enviado a register con el almacenamiento", async () => {
    const input = { ...result };
    await repository.register(input);
    input.conclusion = "altered";
    await expect(repository.findJobByCommit(result.sha, result.owner, result.reponame)).resolves.toEqual(expect.objectContaining(result));
  });

  it("funciona con RegisterTestResultUseCase sin simular register", async () => {
    const useCase = new RegisterTestResultUseCase(repository);
    await expect(useCase.execute(result)).resolves.toBe("created");
    await expect(useCase.execute(result)).resolves.toBe("duplicate");
    await expect(repository.findJobByCommit(result.sha, result.owner, result.reponame)).resolves.toEqual(expect.objectContaining(result));
  });

  it("actualiza la conclusión de una identidad existente", async () => {
    await repository.register(result);
    await repository.updateJobConclusion(result.sha, result.owner, result.reponame, "failure");
    expect(await repository.findJobByCommit(result.sha, result.owner, result.reponame)).toEqual(expect.objectContaining({ ...result, conclusion: "failure" }));
  });

  it("actualiza solo el repositorio indicado cuando comparten SHA", async () => {
    const other = { ...result, reponame: "other" };
    await repository.register(result);
    await repository.register(other);
    await repository.updateJobConclusion(other.sha, other.owner, other.reponame, "failure");
    expect(await repository.findJobByCommit(result.sha, result.owner, result.reponame)).toEqual(expect.objectContaining(result));
    expect(await repository.findJobByCommit(other.sha, other.owner, other.reponame)).toEqual(expect.objectContaining({ ...other, conclusion: "failure" }));
  });

  it("actualiza solo el propietario indicado cuando comparten SHA y repositorio", async () => {
    const other = { ...result, owner: "other" };
    await repository.register(result);
    await repository.register(other);
    await repository.updateJobConclusion(other.sha, other.owner, other.reponame, "failure");
    expect(await repository.findJobByCommit(result.sha, result.owner, result.reponame)).toEqual(expect.objectContaining(result));
    expect(await repository.findJobByCommit(other.sha, other.owner, other.reponame)).toEqual(expect.objectContaining({ ...other, conclusion: "failure" }));
  });

  it("no modifica ningún registro si la identidad solicitada no existe", async () => {
    await repository.register(result);
    const before = await repository.getJobs(result.owner, result.reponame);
    await repository.updateJobConclusion(result.sha, "missing-owner", result.reponame, "failure");
    expect(await repository.getJobs(result.owner, result.reponame)).toEqual(before);
  });

  it("conserva el ID y la cantidad de registros al actualizar", async () => {
    await repository.register(result);
    const before = await repository.getJobs(result.owner, result.reponame);
    const original = await repository.findJobByCommit(result.sha, result.owner, result.reponame);
    await repository.updateJobConclusion(result.sha, result.owner, result.reponame, "failure");
    expect(await repository.getJobs(result.owner, result.reponame)).toHaveLength(before.length);
    expect((await repository.findJobByCommit(result.sha, result.owner, result.reponame))?.id).toBe(original?.id);
  });

  it("evalúa duplicados y conflictos frente a la conclusión actualizada", async () => {
    await repository.register(result);
    await repository.updateJobConclusion(result.sha, result.owner, result.reponame, "failure");
    await expect(repository.register({ ...result, conclusion: "failure" })).resolves.toBe("duplicate");
    await expect(repository.register(result)).resolves.toBe("conflict");
  });
});
