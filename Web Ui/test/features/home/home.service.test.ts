import { buildHomeViewModel } from "../../../src/features/home/services/home.service";

describe("buildHomeViewModel", () => {
  it("builds a personalized greeting from the authenticated email", () => {
    const viewModel = buildHomeViewModel("israel.guzman@ucb.edu.bo");

    expect(viewModel.greeting).toBe("Hola Israel, bienvenido al TDD Lab!!!");
  });
});
