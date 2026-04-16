import { buildHomeViewModel } from "../../../src/features/home/services/home.service";

describe("buildHomeViewModel", () => {
  it("builds a personalized greeting from the authenticated email", () => {
    const viewModel = buildHomeViewModel({
      email: "israel.guzman@ucb.edu.bo",
      userId: 1,
    });

    expect(viewModel.viewState).toBe("success");
    expect(viewModel.greeting).toBe("Hola Israel, bienvenido al TDD Lab!!!");
  });

  it("returns loading while auth data is unresolved", () => {
    const viewModel = buildHomeViewModel({});

    expect(viewModel.viewState).toBe("loading");
  });

  it("returns empty when there is no active email", () => {
    const viewModel = buildHomeViewModel({ email: "", userId: -1 });

    expect(viewModel.viewState).toBe("empty");
  });

  it("returns error when the session has no email field", () => {
    const viewModel = buildHomeViewModel({ userId: 1 });

    expect(viewModel.viewState).toBe("error");
  });
});
