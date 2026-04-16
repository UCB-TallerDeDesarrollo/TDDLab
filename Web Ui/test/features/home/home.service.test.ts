import { buildHomeViewModel } from "../../../src/features/home/services/home.service";

describe("buildHomeViewModel", () => {
  it("builds a personalized greeting from the authenticated email", () => {
    const viewModel = buildHomeViewModel(
      "israel.guzman@ucb.edu.bo",
      "student",
    );

    expect(viewModel.greeting).toBe("Hola Israel, bienvenido al TDD Lab!!!");
  });

  it("returns only the feature links available for the current role", () => {
    const viewModel = buildHomeViewModel("ana@ucb.edu.bo", "student");

    expect(viewModel.availableLinks.map((link) => link.title)).toEqual([
      "Tareas",
      "Mis prácticas",
    ]);
  });
});
