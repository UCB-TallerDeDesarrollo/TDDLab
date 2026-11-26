import { IngestTDDResultsUseCase } from "../../src/modules/TDDCycles/Application/ingestTDDResultsUseCase";
import { FakeTDDResultsRepository } from "../../src/modules/TDDCycles/Repositories/TDDResultsRepository";
import { readFileSync } from "fs";
import path from "path";
const fixture = JSON.parse(readFileSync(path.join(__dirname, "../../../docs/hu08/fixtures/ingest-payload.json"), "utf8"));
describe("HU08 validación de snapshots", () => {
  const fresh = () => JSON.parse(JSON.stringify(fixture));
  it("guarda los dos archivos completos sin mutar el original", async () => {
    const repository = new FakeTDDResultsRepository();
    const input = fresh();
    await expect(new IngestTDDResultsUseCase(repository).execute(input)).resolves.toEqual({ commits: 3, logEntries: 5 });
    input.commitHistory[0].coverage = 0;
    expect((await repository.getSnapshot(fixture.repoOwner, fixture.repoName, "main")).commitHistory).toEqual(fixture.commitHistory);
  });
  it.each(["repoOwner", "repoName", "branch", "commitHistory", "tddLog"])("rechaza el campo ausente %s sin persistir", async field => {
    const repository = new FakeTDDResultsRepository();
    const input = fresh(); delete input[field];
    await expect(new IngestTDDResultsUseCase(repository).execute(input)).rejects.toMatchObject({ field });
    expect(await repository.getCommitHistoryData(fixture.repoOwner, fixture.repoName)).toEqual([]);
  });
  it.each([null, [], "invalid", 1])("rechaza cuerpo inválido %j", async input => {
    await expect(new IngestTDDResultsUseCase(new FakeTDDResultsRepository()).execute(input)).rejects.toMatchObject({ field: "body" });
  });
  it("resuelve HEAD con el SHA real sin modificar el cuerpo", async () => {
    const repository = new FakeTDDResultsRepository();
    const input = fresh();input.sha = input.commitHistory[0].sha;input.commitHistory[0].sha = "HEAD";input.tddLog[1].commitId = "HEAD";
    await new IngestTDDResultsUseCase(repository).execute(input);
    expect(input.commitHistory[0].sha).toBe("HEAD");
    expect((await repository.getSnapshot(fixture.repoOwner, fixture.repoName, "main")).commitHistory[0].sha).toBe(input.sha);
  });
  it.each(["duplicate-sha", "invalid-date", "invalid-count", "invalid-log", "missing-head"])("rechaza %s antes de escribir", async kind => {
    const input = fresh();
    if(kind === "duplicate-sha") input.commitHistory.push(input.commitHistory[0]);
    if(kind === "invalid-date") input.commitHistory[0].commit.date = "invalid";
    if(kind === "invalid-count") input.commitHistory[0].test_count = "2";
    if(kind === "invalid-log") input.tddLog[0].numPassedTests = 20;
    if(kind === "missing-head") input.commitHistory[0].sha = "HEAD";
    const repository = new FakeTDDResultsRepository();
    await expect(new IngestTDDResultsUseCase(repository).execute(input)).rejects.toThrow("Invalid field");
    expect(await repository.getCommitHistoryData(fixture.repoOwner, fixture.repoName)).toEqual([]);
  });
});
