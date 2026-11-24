import { TestResultDataObject } from "./TestResultDataObject";

export type TestResultRegistration = Omit<TestResultDataObject, "id">;
export type RegistrationOutcome = "created" | "duplicate" | "conflict";

export interface ITestResultRegistrationRepository {
  // The implementation must decide and persist atomically for owner + reponame + sha.
  register(result: TestResultRegistration): Promise<RegistrationOutcome>;
}
