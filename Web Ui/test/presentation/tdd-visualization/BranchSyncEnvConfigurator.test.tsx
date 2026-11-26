import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import { VITE_API } from "../../../config";
import BranchSyncEnvConfigurator from "../../../src/presentation/tdd-visualization/components/BranchSyncEnvConfigurator";

jest.mock("axios");

describe("BranchSyncEnvConfigurator", () => {
  afterEach(() => {
    jest.clearAllMocks();
    Reflect.deleteProperty(window, "showSaveFilePicker");
  });

  it("requests credentials with the session cookie and writes the returned .env", async () => {
    const credentials = {
      TDD_SYNC_URL: "https://tddlab.example/api/TDDCycles/sync",
      TDD_SYNC_TOKEN: "repo-scoped-token",
    };
    jest.mocked(axios.post).mockResolvedValue({ data: credentials } as never);
    let savedContents = "";
    const write = jest.fn(async (contents: string) => { savedContents = contents; });
    const close = jest.fn().mockResolvedValue(undefined);
    const createWritable = jest.fn().mockResolvedValue({ write, close });
    const showSaveFilePicker = jest.fn().mockResolvedValue({ createWritable });
    Object.defineProperty(window, "showSaveFilePicker", { configurable: true, value: showSaveFilePicker });

    render(<BranchSyncEnvConfigurator owner="equipo-tddlab" repoName="ejemplo-sprint4" />);
    fireEvent.click(screen.getByRole("button", { name: "Crear .env para sincronizar pruebas" }));

    await waitFor(() => expect(write).toHaveBeenCalled());
    expect(axios.post).toHaveBeenCalledWith(
      `${VITE_API}/TDDCycles/sync/credentials`,
      { repository: { provider: "github", owner: "equipo-tddlab", name: "ejemplo-sprint4" } },
      { withCredentials: true },
    );
    expect(showSaveFilePicker).toHaveBeenCalledWith({ suggestedName: ".env" });
    expect(savedContents).toBe(
      "TDD_SYNC_URL=https://tddlab.example/api/TDDCycles/sync\nTDD_SYNC_TOKEN=repo-scoped-token\n",
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Archivo .env guardado");
  });
});
