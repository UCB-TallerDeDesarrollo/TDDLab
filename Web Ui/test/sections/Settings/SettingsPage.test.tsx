import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ConfigurationPage from "../../../src/sections/Settings/SettingsPage";

const mockGetPromptsExecute = jest.fn();
const mockGetFlagsExecute = jest.fn();
const mockUpdatePromptsExecute = jest.fn();

jest.mock("../../../src/modules/AIAssistant/application/GetPrompts", () => ({
  GetPrompts: jest.fn(() => ({ execute: mockGetPromptsExecute })),
}));

jest.mock("../../../src/modules/AIAssistant/application/UpdatePrompts", () => ({
  UpdatePrompts: jest.fn(() => ({ execute: mockUpdatePromptsExecute })),
}));

jest.mock("../../../src/modules/FeatureFlags/application/GetFeatureFlags", () => ({
  GetFeatureFlags: jest.fn(() => ({ execute: mockGetFlagsExecute })),
}));

jest.mock("../../../src/modules/FeatureFlags/application/UpdateFeatureFlag", () => ({
  UpdateFeatureFlag: jest.fn(() => ({ execute: jest.fn() })),
}));

const promptsData = {
  tddPrompt: "Prompt TDD",
  refactoringPrompt: "Prompt Refactoring",
  evaluateTDDPrompt: "Prompt Evaluar",
};

describe("SettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFlagsExecute.mockResolvedValue([]);
  });

  it("muestra el loader de pantalla completa mientras carga los prompts", () => {
    mockGetPromptsExecute.mockReturnValue(new Promise(() => {}));
    render(<ConfigurationPage />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("oculta el loader y muestra el selector tras cargar", async () => {
    mockGetPromptsExecute.mockResolvedValue(promptsData);
    render(<ConfigurationPage />);
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Configuración de Prompts")).toBeInTheDocument();
  });

  it("muestra el overlay de guardado mientras saving=true", async () => {
    mockGetPromptsExecute.mockResolvedValue(promptsData);
    mockUpdatePromptsExecute.mockReturnValue(new Promise(() => {}));
    render(<ConfigurationPage />);

    await waitFor(() => {
      expect(screen.getByText("Editar Prompt")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Editar Prompt"));
    fireEvent.click(screen.getByText("Guardar"));

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("muestra la sección de flags tras cargar", async () => {
    mockGetPromptsExecute.mockResolvedValue(promptsData);
    mockGetFlagsExecute.mockResolvedValue([
      { id: 1, feature_name: "Feature Test", is_enabled: true },
    ]);
    render(<ConfigurationPage />);
    await waitFor(() => {
      expect(screen.getByText("Feature Test")).toBeInTheDocument();
    });
  });

  it("muestra error de prompts cuando falla la carga", async () => {
    mockGetPromptsExecute.mockRejectedValue(new Error("Error de red"));
    render(<ConfigurationPage />);
    await waitFor(() => {
      expect(
        screen.getByText(/No se pudieron cargar los prompts/i)
      ).toBeInTheDocument();
    });
  });
});
