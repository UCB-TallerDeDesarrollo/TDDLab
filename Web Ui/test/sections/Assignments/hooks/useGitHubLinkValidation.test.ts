import { act, renderHook } from "@testing-library/react";
import { useGitHubLinkValidation } from "../../../../src/sections/Assignments/components/GitValidationHook";

describe("useGitHubLinkValidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with empty repo when initialRepo is undefined", () => {
    const { result } = renderHook(() => useGitHubLinkValidation(undefined));

    expect(result.current.repo).toBe("");
    expect(result.current.validLink).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorMessage).toBe("");
  });

  it("initializes and validates a valid GitHub link from initialRepo", () => {
    const { result } = renderHook(() =>
      useGitHubLinkValidation("https://github.com/usuario/repositorio")
    );

    expect(result.current.repo).toBe("https://github.com/usuario/repositorio");
    expect(result.current.validLink).toBe(true);
    expect(result.current.errorMessage).toBe("");
  });

  it("initializes and marks invalid an empty initialRepo", () => {
    const { result } = renderHook(() => useGitHubLinkValidation(""));

    expect(result.current.validLink).toBe(false);
    expect(result.current.errorMessage).toBe("El enlace no puede estar vacío.");
  });

  describe("validateGitHubLink - valid links", () => {
    it("accepts a standard GitHub repository URL", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      act(() => {
        result.current.handleLinkChange("https://github.com/user/repo");
      });

      expect(result.current.validLink).toBe(true);
      expect(result.current.errorMessage).toBe("");
      expect(result.current.repo).toBe("https://github.com/user/repo");
    });

    it("accepts a GitHub URL with additional path segments", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      act(() => {
        result.current.handleLinkChange("https://github.com/user/repo/issues/1");
      });

      expect(result.current.validLink).toBe(true);
      expect(result.current.errorMessage).toBe("");
    });
  });

  describe("validateGitHubLink - invalid links", () => {
    it("rejects an empty string", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      act(() => {
        result.current.handleLinkChange("");
      });

      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toBe("El enlace no puede estar vacío.");
    });

    it("rejects a whitespace-only string", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      act(() => {
        result.current.handleLinkChange("   ");
      });

      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toBe("El enlace no puede estar vacío.");
    });

    it("rejects a non-GitHub URL", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      act(() => {
        result.current.handleLinkChange("https://gitlab.com/user/repo");
      });

      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toBe("El enlace debe pertenecer a GitHub.");
    });

    it("rejects a URL ending with .git", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      act(() => {
        result.current.handleLinkChange("https://github.com/user/repo.git");
      });

      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toBe("El enlace no debe finalizar con '.git'.");
    });

    it("rejects a GitHub URL without username and repo", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      act(() => {
        result.current.handleLinkChange("https://github.com/");
      });

      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toContain("nombre de usuario y un nombre de repositorio");
    });

    it("rejects a malformed URL", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      act(() => {
        result.current.handleLinkChange("not-a-url");
      });

      expect(result.current.validLink).toBe(false);
      expect(result.current.errorMessage).toContain("Formato esperado");
    });
  });

  describe("handleLinkChange", () => {
    it("accepts a string argument", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      act(() => {
        result.current.handleLinkChange("https://github.com/owner/project");
      });

      expect(result.current.repo).toBe("https://github.com/owner/project");
      expect(result.current.validLink).toBe(true);
    });

    it("accepts a React.ChangeEvent<HTMLInputElement> argument", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      const mockEvent = {
        target: { value: "https://github.com/owner/project" },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      act(() => {
        result.current.handleLinkChange(mockEvent);
      });

      expect(result.current.repo).toBe("https://github.com/owner/project");
      expect(result.current.validLink).toBe(true);
    });

    it("sets isLoading to false after validation completes", () => {
      const { result } = renderHook(() => useGitHubLinkValidation(undefined));

      act(() => {
        result.current.handleLinkChange("https://github.com/user/repo");
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

});
