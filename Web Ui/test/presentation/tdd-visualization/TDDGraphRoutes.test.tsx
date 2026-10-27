import { act, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../../../src/App";

jest.mock("@mui/icons-material", () => ({ NoteAdd: () => null }));
jest.mock("../../../src/app/navigation/MainMenu", () => () => <div>Menu</div>);
jest.mock("../../../src/ProtectedRoute", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("../../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter", () => ({
  CommitHistoryAdapter: jest.fn(),
}));
jest.mock("../../../src/modules/User-Authentication/domain/authStates", () => ({
  useGlobalState: () => [{ userid: 1, userEmail: "teacher@example.com", userRole: "teacher" }],
  setGlobalState: jest.fn(),
}));
jest.mock("../../../src/modules/User-Authentication/application/getSessionCookie", () => ({
  getSessionCookie: jest.fn().mockResolvedValue(null),
}));
jest.mock("../../../src/presentation/tdd-visualization/pages/TDDChartPage", () => ({
  __esModule: true,
  default: () => <div data-testid="tdd-chart-page">Gráficas TDD</div>,
}));

describe("Rutas de gráficas TDD", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
    localStorage.clear();
  });

  it("mantiene la vista principal en /graph", async () => {
    window.history.replaceState({}, "", "/graph?repoOwner=student&repoName=repo");
    await act(async () => { render(<App />); });
    expect(await screen.findByTestId("tdd-chart-page")).toBeInTheDocument();
  });

  it("no monta la vista retirada al abrir /aditionalgraph directamente", async () => {
    window.history.replaceState({}, "", "/aditionalgraph?repoOwner=student&repoName=repo");
    await act(async () => { render(<App />); });
    expect(screen.queryByTestId("tdd-chart-page")).not.toBeInTheDocument();
  });
});
