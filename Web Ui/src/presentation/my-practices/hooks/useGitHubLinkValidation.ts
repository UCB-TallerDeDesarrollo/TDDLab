import { useEffect, useState } from "react";
import { parseGithubRepositoryUrl } from "../../../shared/helpers/githubRepository";

interface UseGitHubLinkValidation {
  repo: string;
  validLink: boolean;
  isLoading: boolean;
  errorMessage: string;
  handleLinkChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | string
  ) => void;
}

export const useGitHubLinkValidation = (
  initialRepo: string | undefined
): UseGitHubLinkValidation => {
  const [repo, setRepo] = useState(initialRepo ?? "");
  const [validLink, setValidLink] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateGitHubLink = (
    text: string
  ): { isValid: boolean; error: string } => {
    if (!text.trim()) {
      return { isValid: false, error: "El enlace no puede estar vacio." };
    }

    if (!parseGithubRepositoryUrl(text)) {
      return {
        isValid: false,
        error: "Enlace invalido. Formato esperado: https://github.com/usuario/repositorio",
      };
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

  const handleLinkChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | string
  ) => {
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
