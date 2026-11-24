import { RegisterTestResultUseCase } from "../../../../src/modules/TDDCycles/Application/registerTestResultUseCase";
import { TestResultValidationError } from "../../../../src/modules/TDDCycles/Application/TestResultValidationError";
import { ITestResultRegistrationRepository } from "../../../../src/modules/TDDCycles/Domain/ITestResultRegistrationRepository";

describe("RegisterTestResultUseCase", () => {
  const validResult = { sha: "short-sha", owner: "demo", reponame: "tests", conclusion: "success" };
  let repository: jest.Mocked<ITestResultRegistrationRepository>;
  let useCase: RegisterTestResultUseCase;

  beforeEach(() => {
    repository = { register: jest.fn() };
    useCase = new RegisterTestResultUseCase(repository);
  });

  it.each(["success", "failure", "skipped"])("registra una conclusión válida: %s", async (conclusion) => {
    const input = { ...validResult, conclusion };
    repository.register.mockResolvedValue("created");

    await expect(useCase.execute(input)).resolves.toBe("created");
    expect(repository.register).toHaveBeenCalledTimes(1);
    expect(repository.register).toHaveBeenCalledWith(input);
  });

  it.each(["sha", "owner", "reponame", "conclusion"])("identifica el campo ausente %s", async (field) => {
    const input: Record<string, unknown> = { ...validResult };
    delete input[field];

    await expect(useCase.execute(input)).rejects.toMatchObject({ field });
    expect(repository.register).not.toHaveBeenCalled();
  });

  it.each(["sha", "owner", "reponame", "conclusion"].flatMap((field) =>
    ["", "   "].map((value) => ({ field, value }))
  ))("rechaza el campo vacío o en blanco $field", async ({ field, value }) => {
    await expect(useCase.execute({ ...validResult, [field]: value })).rejects.toMatchObject({ field });
    expect(repository.register).not.toHaveBeenCalled();
  });

  it.each(["sha", "owner", "reponame", "conclusion"].flatMap((field) =>
    [null, 42, false, {}, []].map((value) => ({ field, value }))
  ))("rechaza tipo incorrecto en $field: $value", async ({ field, value }) => {
    await expect(useCase.execute({ ...validResult, [field]: value })).rejects.toMatchObject({ field });
    expect(repository.register).not.toHaveBeenCalled();
  });

  it("rechaza una conclusión no admitida", async () => {
    await expect(useCase.execute({ ...validResult, conclusion: "pending" })).rejects.toMatchObject({ field: "conclusion" });
    expect(repository.register).not.toHaveBeenCalled();
  });

  it("devuelve duplicate al reenviar el mismo resultado", async () => {
    repository.register.mockResolvedValueOnce("created").mockResolvedValueOnce("duplicate");

    await expect(useCase.execute(validResult)).resolves.toBe("created");
    await expect(useCase.execute(validResult)).resolves.toBe("duplicate");
    expect(repository.register).toHaveBeenCalledTimes(2);
    expect(repository.register).toHaveBeenNthCalledWith(1, validResult);
    expect(repository.register).toHaveBeenNthCalledWith(2, validResult);
  });

  it("registra el mismo SHA en repositorios diferentes", async () => {
    const otherRepository = { ...validResult, reponame: "other" };
    repository.register.mockResolvedValue("created");

    await expect(useCase.execute(validResult)).resolves.toBe("created");
    await expect(useCase.execute(otherRepository)).resolves.toBe("created");
    expect(repository.register).toHaveBeenNthCalledWith(1, validResult);
    expect(repository.register).toHaveBeenNthCalledWith(2, otherRepository);
    expect(repository.register).toHaveBeenCalledTimes(2);
  });

  it("informa conflicto si cambia la conclusión del mismo commit", async () => {
    const differentConclusion = { ...validResult, conclusion: "failure" };
    repository.register.mockResolvedValueOnce("created").mockResolvedValueOnce("conflict");

    await expect(useCase.execute(validResult)).resolves.toBe("created");
    await expect(useCase.execute(differentConclusion)).resolves.toBe("conflict");
    expect(repository.register).toHaveBeenNthCalledWith(1, validResult);
    expect(repository.register).toHaveBeenNthCalledWith(2, differentConclusion);
    expect(repository.register).toHaveBeenCalledTimes(2);
  });

  it("propaga el error del repositorio", async () => {
    const error = new Error("repository unavailable");
    repository.register.mockRejectedValue(error);

    await expect(useCase.execute(validResult)).rejects.toBe(error);
    expect(repository.register).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["null", null], ["undefined", undefined], ["array", []],
    ["string", "body"], ["número", 42], ["booleano", false],
  ])("rechaza cuerpo %s sin llamar al repositorio", async (_label, body) => {
    await expect(useCase.execute(body)).rejects.toMatchObject({ field: "body", message: "Invalid request body" });
    expect(repository.register).not.toHaveBeenCalled();
  });

  it("no llama al repositorio si falta un campo", async () => {
    const { sha: _sha, ...input } = validResult;
    await expect(useCase.execute(input)).rejects.toMatchObject({ field: "sha" });
    expect(repository.register).not.toHaveBeenCalled();
  });

  it("no llama al repositorio si la conclusión es inválida", async () => {
    await expect(useCase.execute({ ...validResult, conclusion: "pending" })).rejects.toMatchObject({ field: "conclusion" });
    expect(repository.register).not.toHaveBeenCalled();
  });

  it("excluye propiedades adicionales al registrar", async () => {
    repository.register.mockResolvedValue("created");
    await useCase.execute({ ...validResult, extra: "ignorado" });
    expect(repository.register).toHaveBeenCalledWith(validResult);
  });

  it("excluye el id proporcionado por el cliente", async () => {
    repository.register.mockResolvedValue("created");
    await useCase.execute({ ...validResult, id: 123 });
    expect(repository.register).toHaveBeenCalledWith(validResult);
  });

  it("llama al repositorio exactamente una vez para una entrada válida", async () => {
    repository.register.mockResolvedValue("created");
    await useCase.execute(validResult);
    expect(repository.register).toHaveBeenCalledTimes(1);
  });

  it("identifica los errores de validación con un tipo específico", async () => {
    await expect(useCase.execute(null)).rejects.toMatchObject({ name: "TestResultValidationError", field: "body" });
    expect(repository.register).not.toHaveBeenCalled();
  });

  it("conserva el tipo y la identidad del error inesperado del repositorio", async () => {
    const error = new Error("repository unavailable");
    repository.register.mockRejectedValue(error);
    await expect(useCase.execute(validResult)).rejects.toBe(error);
    expect(error.name).toBe("Error");
  });

  it.each([
    ["cuerpo", null],
    ["campo", { ...validResult, sha: "" }],
    ["conclusión", { ...validResult, conclusion: "pending" }],
  ])("usa TestResultValidationError para validar %s", async (_label, input) => {
    await expect(useCase.execute(input)).rejects.toBeInstanceOf(TestResultValidationError);
    expect(repository.register).not.toHaveBeenCalled();
  });
});
