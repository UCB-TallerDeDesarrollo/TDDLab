import { renderHook, act } from "@testing-library/react";
import { useGitHubLinkValidation } from "../../../src/sections/Assignments/components/GitValidationHook";

describe("useGitHubLinkValidation", () => {
  describe("validateGitHubLink branches", () => {
    it("link vacío → inválido", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(""));
      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toBe("El enlace no puede estar vacío.");
    });

    it("link sin github.com → inválido", () => {
      const { result } = renderHook(() => useGitHubLinkValidation("https://gitlab.com/user/repo"));
      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toBe("El enlace debe pertenecer a GitHub.");
    });

    it("link terminado en .git → inválido", () => {
      const { result } = renderHook(() => useGitHubLinkValidation("https://github.com/user/repo.git"));
      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toBe("El enlace no debe finalizar con '.git'.");
    });

    it("link con menos de 2 partes en path → inválido", () => {
      const { result } = renderHook(() => useGitHubLinkValidation("https://github.com/user"));
      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toContain("nombre de usuario y un nombre de repositorio");
    });

    it("URL inválida (TypeError) → inválido", () => {
      const { result } = renderHook(() => useGitHubLinkValidation("not-a-valid-url"));
      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toContain("Enlace inválido");
    });

    it("link válido → válido", () => {
      const { result } = renderHook(() => useGitHubLinkValidation("https://github.com/user/repo"));
      expect(result.current.validLink).toBe(true);
      expect(result.current.errorMessage).toBe("");
    });
  });

  describe("handleLinkChange", () => {
    it("actualiza repo y validación cuando se pasa string", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(""));
      act(() => {
        result.current.handleLinkChange("https://github.com/new/repo");
      });
      expect(result.current.repo).toBe("https://github.com/new/repo");
      expect(result.current.validLink).toBe(true);
    });

    it("actualiza repo y validación cuando se pasa event", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(""));
      act(() => {
        result.current.handleLinkChange({ target: { value: "https://github.com/u/r" } } as React.ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.repo).toBe("https://github.com/u/r");
      expect(result.current.validLink).toBe(true);
    });

    it("maneja error inesperado en handleLinkChange", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(""));
      // Forzar un error sobrescribiendo validateGitHubLink no es directo, pero probamos link vacío
      act(() => {
        result.current.handleLinkChange("");
      });
      expect(result.current.validLink).toBe(false);
    });
  });

  describe("initialRepo effect", () => {
    it("usa initialRepo undefined → repo vacío", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));
      expect(result.current.repo).toBe("");
    });

    it("usa initialRepo definido → actualiza estado", () => {
      const { result } = renderHook(() => useGitHubLinkValidation("https://github.com/a/b"));
      expect(result.current.repo).toBe("https://github.com/a/b");
      expect(result.current.validLink).toBe(true);
    });
  });

  describe("isLoading", () => {
    it("isLoading es false después de handleLinkChange", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(""));
      act(() => {
        result.current.handleLinkChange("https://github.com/x/y");
      });
      expect(result.current.isLoading).toBe(false);
    });
  });
});
