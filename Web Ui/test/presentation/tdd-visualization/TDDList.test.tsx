import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TDDList from "../../../src/presentation/tdd-visualization/components/TDDList";
import {
  MockGithubAPI,
  MockGithubAPIEmpty,
  MockGithubAPIError,
} from "./__mocks__/MocksCommitHistory";

function renderList(port: MockGithubAPI | MockGithubAPIEmpty | MockGithubAPIError) {
  return render(
    <MemoryRouter initialEntries={["/?repoOwner=example&repoName=repository"]}>
      <TDDList port={port} />
    </MemoryRouter>,
  );
}

describe("TDDList", () => {
  it("renders already loaded commits without another request and updates when they change", async () => {
    const port = new MockGithubAPI();
    const commits = await port.obtainCommitsOfRepo("example", "repository");
    const obtain = jest.spyOn(port, "obtainCommitsOfRepo");
    const { rerender } = render(<MemoryRouter><TDDList port={port} commits={commits} /></MemoryRouter>);
    expect(screen.getByText(/Commit: Todos los tests del mundo/)).toBeInTheDocument();
    expect(obtain).not.toHaveBeenCalled();
    rerender(<MemoryRouter><TDDList port={port} commits={[]} /></MemoryRouter>);
    expect(screen.getByTestId("emptyMessage")).toBeInTheDocument();
    expect(obtain).not.toHaveBeenCalled();
  });

  it("passes the selected branch when used without preloaded commits", async () => {
    const port = new MockGithubAPI();
    const obtain = jest.spyOn(port, "obtainCommitsOfRepo");
    render(<MemoryRouter initialEntries={["/?repoOwner=example&repoName=repository&branch=feature%2Fdivisor"]}><TDDList port={port} /></MemoryRouter>);
    await screen.findByText(/Commit: Todos los tests del mundo/);
    expect(obtain).toHaveBeenCalledWith("example", "repository", "feature/divisor");
  });
  it("uses the injected repository to render commit blocks", async () => {
    renderList(new MockGithubAPI());

    expect(await screen.findByText(/Commit: Todos los tests del mundo/)).toBeInTheDocument();
  });

  it("announces loading while commits are requested", () => {
    const port = new MockGithubAPI();
    jest.spyOn(port, "obtainCommitsOfRepo").mockReturnValue(new Promise(() => {}));

    renderList(port);

    expect(screen.getByRole("status", { name: "Cargando commits" })).toBeInTheDocument();
  });

  it("shows a clear empty state when the repository has no commits", async () => {
    renderList(new MockGithubAPIEmpty());

    expect(await screen.findByTestId("emptyMessage")).toHaveTextContent(
      "No hay commits disponibles",
    );
    expect(screen.queryByTestId("errorMessage")).not.toBeInTheDocument();
  });

  it("shows an accessible error instead of breaking when the repository fails", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    renderList(new MockGithubAPIError());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los commits",
    );
    consoleError.mockRestore();
  });
});
