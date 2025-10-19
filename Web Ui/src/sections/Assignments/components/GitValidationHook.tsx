import { useState, useEffect } from "react";


interface UseGitHubLinkValidation {
  repo: string;
  validLink: boolean;
  isLoading: boolean;
  errorMessage: string;
  handleLinkChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
}


export const useGitHubLinkValidation = (
  initialRepo: string | undefined
): UseGitHubLinkValidation => {
  const [repo, setRepo] = useState(initialRepo ?? "");
  const [validLink, setValidLink] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const validateGitHubLink = (text: string): { isValid: boolean; error: string } => {
    if (!text || text.trim() === "") {
      return { isValid: false, error: "El enlace no puede estar vacío." };
    }

    try {
      const url = new URL(text);
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);

      if (!text.includes("github.com")) {
        return { isValid: false, error: "El enlace debe pertenecer a GitHub." };
      }

      if (text.endsWith(".git")) {
        return { isValid: false, error: "El enlace no debe finalizar con '.git'." };
      }

      if (pathParts.length < 2) {
        return {
          isValid: false,
          error: "El enlace debe contener un nombre de usuario y un nombre de repositorio (github.com/usuario/repositorio)."
        };
      }

      const [username, repo] = pathParts;

      if (!username || !repo) {
        return {
          isValid: false,
          error: "El enlace debe contener un nombre de usuario y un nombre de repositorio válidos."
        };
      }

    } catch (error) {
      if (error instanceof TypeError) {
        return {
          isValid: false,
          error: "Enlace inválido. Formato esperado: https://github.com/usuario/repositorio"
        };
      }
      throw new Error(`Error validando enlace GitHub: ${error instanceof Error ? error.message : String(error)}`);
    }

    return { isValid: true, error: "" };
  };

  useEffect(() => {
    if (initialRepo !== undefined) {
      setRepo(initialRepo);
      const { isValid, error } = validateGitHubLink(initialRepo);
      setValidLink(isValid);
      setErrorMessage(error);
    }
  }, [initialRepo]);


  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const newLink = typeof e === "string" ? e : e.target.value;
    setIsLoading(true);
    setRepo(newLink);

    try {
      const { isValid, error } = validateGitHubLink(newLink);
      setValidLink(isValid);
      setErrorMessage(error);
    } catch (error) {
      setValidLink(false);
      setErrorMessage("Error inesperado al validar el enlace.");
      console.error("Error validating GitHub link:", error);
    }

    setIsLoading(false);
  };

  return { repo, validLink, isLoading, errorMessage, handleLinkChange };

};

