import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TDDChartPage from "../../../src/presentation/tdd-visualization/pages/TDDChartPage";
import {
  MockGithubAPI,
  MockGithubAPIEmpty,
  MockGithubAPIError,
  MockGithubAPIMasterNoTests,
  MockGithubAPITDDLogsError,
} from "./__mocks__/MocksCommitHistory";

const commitsErrorMessage =
  'Error: Verifica que el repositorio utilice la rama "main". Actualmente, TDDLab no puede cargar los datos si la rama principal es "master"';
const testsErrorMessage =
  "Error: No se pudieron cargar los datos de las pruebas, es posible que estes utilizando una versión anterior del repositorio base, o no hayas ejecutado ninguna prueba.";

// Mock de `useNavigate` con tipo explícito
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useSearchParams: jest.fn(() => {
    const params = new URLSearchParams();
    const getMock = jest.fn();
    getMock.mockReturnValueOnce("exampleOwner"); // Setea el valor deseado
    getMock.mockReturnValueOnce("exampleRepo"); // Setea el valor deseado
    params.get = getMock;
    return [params];
  }),
}));

describe("TDDChartPage", () => {
  test.each([["admin"], ["student"]])(
    "renders loading spinner when loading is true for role %s",
    async (role) => {
      const { getByTestId } = render(
        <TDDChartPage
          port={new MockGithubAPI()}
          role={role}
          teacher_id={294}
        />,
      );

      await waitFor(() => {
        const loadingSpinner = getByTestId("loading-spinner");
        expect(loadingSpinner).toBeInTheDocument();
      });
    },
  );

  test.each([["admin"], ["student"]])(
    "displays only the commits error when commits are unavailable for role %s",
    async (role) => {
      const { getByTestId, queryByText } = render(
        <TDDChartPage
          port={new MockGithubAPIEmpty()}
          role={role}
          teacher_id={294}
        />,
      );

      await waitFor(() => {
        expect(getByTestId("errorMessage")).toHaveTextContent(
          commitsErrorMessage,
        );
      });

      expect(
        queryByText(/No se pudieron cargar los datos de las pruebas/),
      ).not.toBeInTheDocument();
      expect(queryByText("No data available")).not.toBeInTheDocument();
    },
  );

  test.each([["admin"], ["student"]])(
    "displays main's missing test data message for role %s",
    async (role) => {
      const { getByTestId, queryByText } = render(
        <TDDChartPage
          port={new MockGithubAPIMasterNoTests()}
          role={role}
          teacher_id={294}
          graphs="graph"
        />,
      );

      await waitFor(() => {
        expect(getByTestId("errorMessage")).toHaveTextContent(
          testsErrorMessage,
        );
      });

      expect(queryByText(commitsErrorMessage)).not.toBeInTheDocument();
      expect(queryByText("No data available")).not.toBeInTheDocument();
    },
  );

  test.each([["admin"], ["student"]])(
    "displays the repository name for role %s",
    async (role) => {
      const { getByTestId } = render(
        <TDDChartPage
          port={new MockGithubAPI()}
          role={role}
          teacher_id={294}
        />,
      );

      await waitFor(() => {
        const repoName = getByTestId("repoNameTitle");
        expect(repoName).toBeInTheDocument();

        if (role === "admin") {
          const repoOwner = getByTestId("repoOwnerTitle");
          expect(repoOwner).toBeInTheDocument();
        }
      });
    },
  );

  it("keeps commit and test data failures separated when only test data fails", async () => {
    const { getByTestId, queryByText } = render(
      <TDDChartPage
        port={new MockGithubAPITDDLogsError()}
        role="admin"
        teacher_id={294}
        graphs="graph"
      />,
    );

    await waitFor(() => {
      expect(getByTestId("errorMessage")).toHaveTextContent(testsErrorMessage);
    });

    expect(queryByText(commitsErrorMessage)).not.toBeInTheDocument();
  });

  it("prioritizes the commits error when all visualization requests fail", async () => {
    const { getByTestId, queryByText } = render(
      <TDDChartPage
        port={new MockGithubAPIError()}
        role="admin"
        teacher_id={294}
        graphs="graph"
      />,
    );

    await waitFor(() => {
      expect(getByTestId("errorMessage")).toHaveTextContent(
        commitsErrorMessage,
      );
    });

    expect(
      queryByText(/No se pudieron cargar los datos de las pruebas/),
    ).not.toBeInTheDocument();
  });
});
