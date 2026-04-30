import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GitLinkDialog } from "../../../../src/sections/Assignments/components/GitHubLinkDialog";
import { useGitHubLinkValidation } from "../../../../src/sections/Assignments/components/GitValidationHook";

jest.mock("../../../../src/sections/Assignments/components/GitValidationHook");

const mockUseGitHubLinkValidation = useGitHubLinkValidation as jest.MockedFunction<typeof useGitHubLinkValidation>;

describe("GitHubLinkDialog", () => {
  const onClose = jest.fn();
  const onSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no renderiza cuando open es false", () => {
    mockUseGitHubLinkValidation.mockReturnValue({
      repo: "",
      validLink: false,
      errorMessage: "",
      isLoading: false,
      handleLinkChange: jest.fn(),
    });
    render(<GitLinkDialog open={false} onClose={onClose} onSend={onSend} />);
    expect(screen.queryByText("Link de Github")).not.toBeInTheDocument();
  });

  it("renderiza cuando open es true", () => {
    mockUseGitHubLinkValidation.mockReturnValue({
      repo: "",
      validLink: false,
      errorMessage: "",
      isLoading: false,
      handleLinkChange: jest.fn(),
    });
    render(<GitLinkDialog open={true} onClose={onClose} onSend={onSend} />);
    expect(screen.getByText("Link de Github")).toBeInTheDocument();
  });

  it("color de input es primary cuando link está vacío", () => {
    mockUseGitHubLinkValidation.mockReturnValue({
      repo: "",
      validLink: false,
      errorMessage: "",
      isLoading: false,
      handleLinkChange: jest.fn(),
    });
    render(<GitLinkDialog open={true} onClose={onClose} onSend={onSend} />);
    const input = screen.getByLabelText("Enlace de Github");
    expect(input).toHaveAttribute("color", "primary");
  });

  it("color de input es error cuando link es inválido", () => {
    mockUseGitHubLinkValidation.mockReturnValue({
      repo: "invalid",
      validLink: false,
      errorMessage: "Enlace inválido. Formato esperado: https://github.com/usuario/repositorio",
      isLoading: false,
      handleLinkChange: jest.fn(),
    });
    render(<GitLinkDialog open={true} onClose={onClose} onSend={onSend} />);
    const input = screen.getByLabelText("Enlace de Github");
    expect(input).toHaveAttribute("color", "error");
  });

  it("color de input es success cuando link es válido", () => {
    mockUseGitHubLinkValidation.mockReturnValue({
      repo: "https://github.com/user/repo",
      validLink: true,
      errorMessage: "",
      isLoading: false,
      handleLinkChange: jest.fn(),
    });
    render(<GitLinkDialog open={true} onClose={onClose} onSend={onSend} />);
    const input = screen.getByLabelText("Enlace de Github");
    expect(input).toHaveAttribute("color", "success");
  });

  it("muestra mensaje de error cuando link es inválido y no vacío", () => {
    mockUseGitHubLinkValidation.mockReturnValue({
      repo: "invalid",
      validLink: false,
      errorMessage: "Enlace inválido. Formato esperado: https://github.com/usuario/repositorio",
      isLoading: false,
      handleLinkChange: jest.fn(),
    });
    render(<GitLinkDialog open={true} onClose={onClose} onSend={onSend} />);
    expect(screen.getByText("Enlace inválido. Formato esperado: https://github.com/usuario/repositorio")).toBeInTheDocument();
  });

  it("no envía cuando link es inválido", () => {
    mockUseGitHubLinkValidation.mockReturnValue({
      repo: "invalid",
      validLink: false,
      errorMessage: "Enlace inválido. Formato esperado: https://github.com/usuario/repositorio",
      isLoading: false,
      handleLinkChange: jest.fn(),
    });
    render(<GitLinkDialog open={true} onClose={onClose} onSend={onSend} />);
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("envía link válido cuando se hace clic en Enviar", async () => {
    const onSendMock = jest.fn().mockResolvedValue(undefined);
    mockUseGitHubLinkValidation.mockReturnValue({
      repo: "https://github.com/user/repo",
      validLink: true,
      errorMessage: "",
      isLoading: false,
      handleLinkChange: jest.fn(),
    });
    render(<GitLinkDialog open={true} onClose={onClose} onSend={onSendMock} />);
    fireEvent.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onSendMock).toHaveBeenCalledWith("https://github.com/user/repo");
  });

  it("deshabilita botón Enviar cuando link está vacío", () => {
    mockUseGitHubLinkValidation.mockReturnValue({
      repo: "",
      validLink: false,
      errorMessage: "",
      isLoading: false,
      handleLinkChange: jest.fn(),
    });
    render(<GitLinkDialog open={true} onClose={onClose} onSend={onSend} />);
    const sendButton = screen.getByRole("button", { name: "Enviar" });
    expect(sendButton).toBeDisabled();
  });

  it("deshabilita botón Enviar mientras está enviando", async () => {
    const onSendMock = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    mockUseGitHubLinkValidation.mockReturnValue({
      repo: "https://github.com/user/repo",
      validLink: true,
      errorMessage: "",
      isLoading: false,
      handleLinkChange: jest.fn(),
    });
    render(<GitLinkDialog open={true} onClose={onClose} onSend={onSendMock} />);
    const sendButton = screen.getByRole("button", { name: "Enviar" });
    fireEvent.click(sendButton);
    expect(sendButton).toBeDisabled();
  });
});
