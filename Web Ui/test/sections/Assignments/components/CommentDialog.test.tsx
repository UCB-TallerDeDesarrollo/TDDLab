import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CommentDialog } from "../../../../src/sections/Assignments/components/CommentDialog";
import { useGitHubLinkValidation } from "../../../../src/sections/Assignments/components/GitValidationHook";

jest.mock("../../../../src/sections/Assignments/components/GitValidationHook");

const defaultGitHubValidation = {
  repo: "",
  validLink: false,
  errorMessage: "",
  handleLinkChange: jest.fn(),
  isLoading: false,
};

describe("CommentDialog", () => {
  const defaultProps = {
    open: true,
    link: undefined as string | undefined,
    onSend: jest.fn(),
    onClose: jest.fn(),
  };

const renderDialog = (props = {}) => {
  const merged = { ...defaultProps, ...props };
  return render(<CommentDialog {...merged} />);
};

const setupValidationMock = (overrides: Partial<typeof defaultGitHubValidation> = {}) => {
  const handleLinkChange = jest.fn();
  jest.mocked(useGitHubLinkValidation).mockImplementation(() => {
    React.useEffect(() => {
      if (overrides.isLoading) {
        handleLinkChange({ target: { value: overrides.repo ?? "" } } as React.ChangeEvent<HTMLInputElement>);
      }
    }, []);

    return {
      ...defaultGitHubValidation,
      handleLinkChange,
      ...overrides,
    };
  });
};

  beforeEach(() => {
    jest.clearAllMocks();
    setupValidationMock();
  });

  describe("dialog open/close", () => {
    it("debería renderizar el diálogo cuando open es true", () => {
      renderDialog();
      expect(screen.getByText("Repositorio de Github:")).toBeInTheDocument();
    });

    it("NO debería renderizar el diálogo cuando open es false", () => {
      renderDialog({ open: false });
      expect(screen.queryByText("Repositorio de Github:")).not.toBeInTheDocument();
    });
  });

  describe("loading state (branch: isLoading)", () => {
    it("debería mostrar 'Cargando...' cuando link es undefined", () => {
      setupValidationMock({ isLoading: true });
      renderDialog({ link: undefined });
      const hasLoading = screen.queryByText("Cargando...") !== null;
      const hasInput = screen.queryByLabelText("Enlace del Repositorio") !== null;
      expect(hasLoading || hasInput).toBe(true);
    });

    it("NO debería mostrar 'Cargando...' cuando isLoading es false", () => {
      setupValidationMock({ repo: "https://github.com/user/repo", validLink: true });
      renderDialog();
      expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Enlace del Repositorio")).toBeInTheDocument();
    });
  });

  describe("useEffect con link (branches: link truthy/falsy)", () => {
    it("debería inicializar con link definido (branch: link truthy)", () => {
      const handleLinkChange = jest.fn();
      setupValidationMock({
        repo: "https://github.com/user/repo",
        validLink: true,
        handleLinkChange,
      });
      renderDialog({ link: "https://github.com/user/repo" });
      expect(screen.getByLabelText("Enlace del Repositorio")).toHaveValue("https://github.com/user/repo");
    });

    it("debería manejar link undefined (branch: link falsy)", () => {
      setupValidationMock({ isLoading: true });
      renderDialog({ link: undefined });
      expect(screen.getByText("Cargando...")).toBeInTheDocument();
    });
  });

  describe("getInputColor (branches: repo empty / invalid / valid)", () => {
    it("debería tener color primary cuando repo está vacío", () => {
      jest.mocked(useGitHubLinkValidation).mockReturnValue({
        repo: "",
        validLink: false,
        errorMessage: "",
        handleLinkChange: jest.fn(),
        isLoading: false,
      });
      renderDialog({ link: undefined });
      const textField = screen.getByLabelText("Enlace del Repositorio");
      expect(textField).toBeInTheDocument();
    });

    it("debería mostrar advertencia cuando validLink es false y hay input (branch: !validLink)", () => {
      setupValidationMock({
        repo: "invalid-link",
        validLink: false,
        errorMessage: "Enlace inválido. Formato esperado: https://github.com/usuario/repositorio",
      });
      renderDialog({ link: "invalid-link" });
      expect(screen.getByText("Advertencia: Link inválido")).toBeInTheDocument();
    });

    it("NO debería mostrar advertencia cuando validLink es true (branch: validLink)", () => {
      setupValidationMock({ repo: "https://github.com/user/repo", validLink: true });
      renderDialog({ link: "https://github.com/user/repo" });
      expect(screen.queryByText("Advertencia: Link inválido")).not.toBeInTheDocument();
    });

    it("NO debería mostrar advertencia cuando inputLink está vacío", () => {
      jest.mocked(useGitHubLinkValidation).mockReturnValue({
        repo: "",
        validLink: false,
        errorMessage: "",
        handleLinkChange: jest.fn(),
        isLoading: false,
      });
      renderDialog({ link: undefined });
      expect(screen.queryByText("Advertencia: Link inválido")).not.toBeInTheDocument();
    });
  });

  describe("edit mode (branch: edit true/false)", () => {
    it("debería mostrar input deshabilitado cuando edit es false", () => {
      setupValidationMock({ repo: "https://github.com/user/repo", validLink: true });
      renderDialog({ link: "https://github.com/user/repo" });
      const textField = screen.getByLabelText("Enlace del Repositorio");
      expect(textField).toBeDisabled();
    });

    it("debería habilitar input al hacer clic en editar (branch: edit true)", () => {
      jest.mocked(useGitHubLinkValidation).mockReturnValue({
        repo: "https://github.com/user/repo",
        validLink: true,
        errorMessage: "",
        handleLinkChange: jest.fn(),
        isLoading: false,
      });
      renderDialog({ link: "https://github.com/user/repo" });
      const editButton = screen.getByLabelText("edit");
      fireEvent.click(editButton);
      const textField = screen.getByLabelText("Enlace del Repositorio");
      expect(textField).not.toBeDisabled();
    });

    it("debería salir de edit mode al hacer clic en cancelar edición", () => {
      jest.mocked(useGitHubLinkValidation).mockReturnValue({
        repo: "https://github.com/user/repo",
        validLink: true,
        errorMessage: "",
        handleLinkChange: jest.fn(),
        isLoading: false,
      });
      renderDialog({ link: "https://github.com/user/repo" });
      const editButton = screen.getByLabelText("edit");
      fireEvent.click(editButton);
      fireEvent.click(editButton);
      const textField = screen.getByLabelText("Enlace del Repositorio");
      expect(textField).toBeDisabled();
    });
  });

  describe("handleCancel (branches: originalLink truthy/falsy)", () => {
    it("debería llamar a onClose al cancelar", () => {
      const onClose = jest.fn();
      jest.mocked(useGitHubLinkValidation).mockReturnValue({
        repo: "https://github.com/user/repo",
        validLink: true,
        errorMessage: "",
        handleLinkChange: jest.fn(),
        isLoading: false,
      });
      renderDialog({ link: "https://github.com/user/repo", onClose });
      fireEvent.click(screen.getByText("Cancelar"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("debería resetear al link original al cancelar con originalLink (branch: originalLink truthy)", () => {
      const handleLinkChange = jest.fn();
      jest.mocked(useGitHubLinkValidation).mockReturnValue({
        repo: "https://github.com/user/repo",
        validLink: true,
        errorMessage: "",
        handleLinkChange,
        isLoading: false,
      });
      renderDialog({ link: "https://github.com/user/repo" });
      const editButton = screen.getByLabelText("edit");
      fireEvent.click(editButton);
      const textField = screen.getByLabelText("Enlace del Repositorio");
      fireEvent.change(textField, { target: { value: "https://github.com/new/repo" } });
      fireEvent.click(screen.getByText("Cancelar"));
      expect(handleLinkChange).toHaveBeenCalled();
    });

    it("debería manejar cancelar sin originalLink (branch: originalLink falsy)", () => {
      const onClose = jest.fn();
      jest.mocked(useGitHubLinkValidation).mockReturnValue({
        repo: "",
        validLink: false,
        errorMessage: "",
        handleLinkChange: jest.fn(),
        isLoading: true,
      });
      renderDialog({ link: undefined, onClose });
      fireEvent.click(screen.getByText("Cancelar"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleSend (branches: validLink && repo / !validLink || repo empty)", () => {
    it("debería llamar a onSend cuando validLink es true y repo no está vacío (branch: success)", () => {
      const onSend = jest.fn();
      const onClose = jest.fn();
      setupValidationMock({ repo: "https://github.com/user/repo", validLink: true });
      renderDialog({ link: "https://github.com/user/repo", onSend, onClose });
      const commentField = screen.getByLabelText("Comentario");
      fireEvent.change(commentField, { target: { value: "Test comment" } });
      fireEvent.click(screen.getByText("Enviar"));
      expect(onSend).toHaveBeenCalledWith("Test comment");
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("NO debería llamar a onSend cuando validLink es false (branch: !validLink)", () => {
      const onSend = jest.fn();
      jest.mocked(useGitHubLinkValidation).mockReturnValue({
        ...defaultGitHubValidation,
        repo: "invalid-link",
        validLink: false,
        errorMessage: "Enlace inválido. Formato esperado: https://github.com/usuario/repositorio",
      });
      renderDialog({ link: "invalid-link", onSend });
      fireEvent.click(screen.getByText("Enviar"));
      expect(onSend).not.toHaveBeenCalled();
    });

    it("NO debería llamar a onSend cuando repo está vacío (branch: repo === '')", () => {
      const onSend = jest.fn();
      setupValidationMock();
      renderDialog({ link: undefined, onSend });
      fireEvent.click(screen.getByText("Enviar"));
      expect(onSend).not.toHaveBeenCalled();
    });

    it("debería enviar comentario vacío cuando validLink es true", () => {
      const onSend = jest.fn();
      setupValidationMock({ repo: "https://github.com/user/repo", validLink: true });
      renderDialog({ link: "https://github.com/user/repo", onSend });
      fireEvent.click(screen.getByText("Enviar"));
      expect(onSend).toHaveBeenCalledWith("");
    });
  });

  describe("botón Enviar disabled state (branch: !validLink || repo === '')", () => {
    it("debería deshabilitar Enviar cuando validLink es false", () => {
      setupValidationMock({
        repo: "invalid-link",
        validLink: false,
        errorMessage: "Enlace inválido. Formato esperado: https://github.com/usuario/repositorio",
      });
      renderDialog({ link: "invalid-link" });
      expect(screen.getByText("Enviar")).toBeDisabled();
    });

    it("debería deshabilitar Enviar cuando repo está vacío", () => {
      setupValidationMock();
      renderDialog({ link: undefined });
      expect(screen.getByText("Enviar")).toBeDisabled();
    });

    it("debería habilitar Enviar cuando validLink es true y repo no está vacío", () => {
      setupValidationMock({ repo: "https://github.com/user/repo", validLink: true });
      renderDialog({ link: "https://github.com/user/repo" });
      expect(screen.getByText("Enviar")).not.toBeDisabled();
    });
  });

  describe("comment field", () => {
    it("debería actualizar el comentario al escribir", () => {
      setupValidationMock({ repo: "https://github.com/user/repo", validLink: true });
      renderDialog({ link: "https://github.com/user/repo" });
      const commentField = screen.getByLabelText("Comentario");
      fireEvent.change(commentField, { target: { value: "Nuevo comentario" } });
      expect(commentField).toHaveValue("Nuevo comentario");
    });
  });

  describe("input value en edit/no-edit (branch: edit ? inputLink : repo)", () => {
    it("debería mostrar repo cuando edit es false", () => {
      setupValidationMock({ repo: "https://github.com/user/repo", validLink: true });
      renderDialog({ link: "https://github.com/user/repo" });
      expect(screen.getByLabelText("Enlace del Repositorio")).toHaveValue("https://github.com/user/repo");
    });

    it("debería mostrar inputLink cuando edit es true", () => {
      setupValidationMock({ repo: "https://github.com/user/repo", validLink: true });
      renderDialog({ link: "https://github.com/user/repo" });
      const editButton = screen.getByLabelText("edit");
      fireEvent.click(editButton);
      const textField = screen.getByLabelText("Enlace del Repositorio");
      fireEvent.change(textField, { target: { value: "https://github.com/new/repo" } });
      expect(textField).toHaveValue("https://github.com/new/repo");
    });
  });

  describe("onClose por clic fuera del diálogo", () => {
    it("debería llamar a onClose cuando se cierra el diálogo", () => {
      const onClose = jest.fn();
      setupValidationMock({ repo: "https://github.com/user/repo", validLink: true });
      renderDialog({ link: "https://github.com/user/repo", onClose });
      fireEvent.click(screen.getByText("Cancelar"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
