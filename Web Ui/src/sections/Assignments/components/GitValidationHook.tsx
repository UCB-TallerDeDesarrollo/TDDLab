import { useState } from "react";

interface UseGitHubLinkValidation {
  repo: string;
  validLink: boolean;
  isLoading: boolean; // Estado para mostrar la carga
  handleLinkChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
}

export const useGitHubLinkValidation = (
  initialRepo: string | undefined
): UseGitHubLinkValidation => {
  const [repo, setRepo] = useState(initialRepo ?? "");
  const [validLink, setValidLink] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  const validateGitHubLink = (text: string): boolean => {
    const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
    return regex.test(text) && !text.endsWith(".git");
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const newLink = typeof e === "string" ? e : e.target.value;
    setIsLoading(true); // Inicia la carga
  
    setRepo(newLink); // Actualiza el estado del repositorio
    setValidLink(validateGitHubLink(newLink));
    setIsLoading(false); // Finaliza la carga
  };

  return { repo, validLink, isLoading, handleLinkChange };
};