import { render, waitFor, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSearchParams } from "react-router-dom";
import TDDChartPage from "../../../src/presentation/tdd-visualization/pages/TDDChartPage";
import { branchHistoryMock } from "../../../src/presentation/tdd-visualization/mocks/branchHistoryMock";
import type {
  BranchHistories,
  BranchHistory,
  BranchHistoryRepository,
} from "../../../src/modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import {
  MockGithubAPI,
  MockGithubAPIEmpty,
  MockGithubAPIError,
} from "./__mocks__/MocksCommitHistory";

// Esta suite verifica la página, no el renderizado de Chart.js.
// El selector y los símbolos tienen sus propias suites.
jest.mock("../../../src/presentation/tdd-visualization/components/TDDChart", () => ({
  __esModule: true,
  default: () => <div data-testid="mock-tdd-charts" />,
}));

// La carga de comentarios no debe consultar el backend durante estas pruebas.
jest.mock("../../../src/modules/teacherCommentsOnSubmissions/repository/CommentsRepository", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getCommentsBySubmissionId: jest.fn().mockResolvedValue([]),
  })),
}));

// Mock de `useNavigate` con tipo explícito
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useSearchParams: jest.fn(),
}));

const demoHistoryByBranch = new Map(
  branchHistoryMock.branches.map(branch => [branch.branch, branch]),
);
const branchHistoryPort: BranchHistoryRepository = {
  obtainBranches: jest.fn(async () => [...demoHistoryByBranch.keys()]),
  obtainBranchHistory: jest.fn(async (_owner: string, _repoName: string, branch: string) => {
    const history = demoHistoryByBranch.get(branch);
    if (!history) throw new Error(`No fixture for branch ${branch}`);
    return history;
  }),
};

function setRepositoryQuery(owner = "exampleOwner", repoName = "exampleRepo") {
  const params = new URLSearchParams({ repoOwner: owner, repoName });
  jest.mocked(useSearchParams).mockReturnValue([params, jest.fn()]);
}

describe("TDDChartPage", () => {
  beforeEach(() => {
    setRepositoryQuery();
    jest.mocked(branchHistoryPort.obtainBranchHistory).mockImplementation(async (_owner, _repoName, branch) => {
      const history = demoHistoryByBranch.get(branch);
      if (!history) throw new Error(`No fixture for branch ${branch}`);
      return history;
    });
    jest.mocked(branchHistoryPort.obtainBranchHistory).mockClear();
  });
  test.each([["admin"], ["student"]])(
    "mantiene las gráficas sin atribuir la ausencia del log a falta de pruebas para %s",
    async (role) => {
      // El puerto devuelve métricas de commits y un log vacío.
      const { findByTestId, queryByTestId, queryByText } = render(
        <TDDChartPage port={new MockGithubAPI()} role={role} teacher_id={294} graphs="graph" />
      );

      expect(await findByTestId("mock-tdd-charts")).toBeInTheDocument();
      expect(queryByTestId("errorMessage")).not.toBeInTheDocument();
      expect(queryByText(/no hayas ejecutado ninguna prueba/i)).not.toBeInTheDocument();
    }
  );

  it("loads BL-02 history automatically for the fixture repository", async () => {
    setRepositoryQuery("equipo-tddlab", "ejemplo-sprint4");
    const { findByRole } = render(
      <TDDChartPage port={new MockGithubAPI()} branchHistoryPort={branchHistoryPort} role="student" teacher_id={294} graphs="graph" />,
    );

    const graph = await findByRole("region", { name: "Historial de commits por ramas" });
    expect(graph).toBeInTheDocument();
    const firstCommitCenters = ["main", "rama-a", "rama-b"].map(branch => {
      const marker = graph.querySelector(`[aria-label^="Commit 1 en ${branch}:"] circle`);
      return Number(marker?.getAttribute("cx"));
    });
    expect(firstCommitCenters.every(Number.isFinite)).toBe(true);
    expect(new Set(firstCommitCenters).size).toBe(3);
    expect(branchHistoryPort.obtainBranchHistory).toHaveBeenNthCalledWith(
      1, "equipo-tddlab", "ejemplo-sprint4", "main",
    );
    expect(branchHistoryPort.obtainBranchHistory).toHaveBeenNthCalledWith(
      2, "equipo-tddlab", "ejemplo-sprint4", "rama-a",
    );
    expect(branchHistoryPort.obtainBranchHistory).toHaveBeenNthCalledWith(
      3, "equipo-tddlab", "ejemplo-sprint4", "rama-b",
    );

    fireEvent.mouseEnter(graph.querySelector('[aria-label*="Commit 2 en rama-a"]')!);
    expect(await findByRole("tooltip")).toHaveTextContent(/Total N.mero de Tests: 3/);
  });

  it("can load BL-02 history when the original chart has no commits", async () => {
    setRepositoryQuery("equipo-tddlab", "ejemplo-sprint4");
    const { findByRole, queryByTestId } = render(
      <TDDChartPage port={new MockGithubAPIEmpty()} branchHistoryPort={branchHistoryPort} role="student" teacher_id={294} graphs="graph" />,
    );

    expect(queryByTestId("errorMessage")).not.toBeInTheDocument();
    expect(await findByRole("region", { name: "Historial de commits por ramas" })).toBeInTheDocument();
  });

  it("does not request BL-02 branches or attribute its history to another repository", async () => {
    setRepositoryQuery("Luiscuac", "TotalizadorVentasIngSoftware");
    const { findByRole, findByText } = render(
      <TDDChartPage port={new MockGithubAPI()} branchHistoryPort={branchHistoryPort} role="student" teacher_id={294} graphs="graph" />,
    );

    fireEvent.click(await findByRole("button", { name: /Ver gr.*fica: Total N.*mero de Tests/ }));

    expect(await findByText("No hay historial TDD disponible para este repositorio.")).toBeInTheDocument();
    expect(branchHistoryPort.obtainBranchHistory).not.toHaveBeenCalled();
  });

  it("shows empty data when commits have no test results instead of plotting zero", async () => {
    setRepositoryQuery("equipo-tddlab", "ejemplo-sprint4");
    const noResultsHistory: BranchHistories = {
      ...branchHistoryMock,
      branches: branchHistoryMock.branches.map((branch: BranchHistory) => ({
        ...branch,
        commits: branch.commits.map(commit => ({ ...commit, metrics: null })),
        executions: [],
      })),
    };
    jest.mocked(branchHistoryPort.obtainBranchHistory).mockImplementation(async (_owner, _repoName, branch) => {
      const history = noResultsHistory.branches.find(item => item.branch === branch);
      if (!history) throw new Error(`No fixture for branch ${branch}`);
      return history;
    });
    const { findByText, queryByRole } = render(
      <TDDChartPage port={new MockGithubAPI()} branchHistoryPort={branchHistoryPort} role="student" teacher_id={294} graphs="graph" />,
    );

    expect(await findByText("No hay resultados de pruebas asociados a los commits de este repositorio.")).toBeInTheDocument();
    expect(queryByRole("region", { name: "Historial de commits por ramas" })).not.toBeInTheDocument();
  });

  test.each([["admin"], ["student"]])(
    "renders loading spinner when loading is true for role %s",
    async (role) => {
      const { getByTestId } = render(
        <TDDChartPage port={new MockGithubAPI()} role={role} teacher_id={294} graphs="graph"/>
      );

      await waitFor(() => {
        const loadingSpinner = getByTestId("loading-spinner");
        expect(loadingSpinner).toBeInTheDocument();
      });
    }
  );

  test.each([["admin"], ["student"]])(
    "displays an error message when no data is available for role %s",
    async (role) => {
      setRepositoryQuery("anotherOwner", "anotherRepo");
      const { getByTestId } = render(
        <TDDChartPage port={new MockGithubAPIEmpty()} role={role} teacher_id={294} graphs="graph"/>
      );

      await waitFor(() => {
        const error = getByTestId("errorMessage");
        expect(error).toBeInTheDocument();
      });
    }
  );

  test.each([["admin"], ["student"]])(
    "displays the repository name for role %s",
    async (role) => {
      const { getByTestId } = render(
        <TDDChartPage port={new MockGithubAPI()} role={role} teacher_id={294} graphs="graph"/>
      );

      await waitFor(() => {
        const repoName = getByTestId("repoNameTitle");
        expect(repoName).toBeInTheDocument();

        if (role === "admin") {
          const repoOwner = getByTestId("repoOwnerTitle");
          expect(repoOwner).toBeInTheDocument();
        }
      });
    }
  );

  it("tests the catch event for both, obtainJobsData and obtainCommitsData", async () => {
    const spyConsoleError = jest.spyOn(console, "error");
    spyConsoleError.mockImplementation(() => {});

    await act(async () => {
      render(<TDDChartPage port={new MockGithubAPIError()} role="admin" teacher_id={294} graphs="graph"/>);
    });

    expect(spyConsoleError).toHaveBeenCalledWith(
      "Error obtaining data:",
      expect.any(Error)
    );
    spyConsoleError.mockRestore();
  });
});
