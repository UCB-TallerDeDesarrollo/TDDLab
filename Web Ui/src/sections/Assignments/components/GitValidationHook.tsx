import { useState } from "react";

interface UseGitHubLinkValidation {
  repo: string;
  validLink: boolean;
  errorMessage: string;
  handleLinkChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
}

export const useGitHubLinkValidation = (
  initialRepo: string | undefined
): UseGitHubLinkValidation => {
  const [repo, setRepo] = useState(initialRepo ?? "");
  const [validLink, setValidLink] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const validateGitHubLink = (text: string): { isValid: boolean; error: string } => {
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
      return { 
        isValid: false, 
        error: "Enlace inválida. Formato esperado: https://github.com/usuario/repositorio" 
      };
    }
    
    return { isValid: true, error: "" };
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement> | string) => {
    const newLink = typeof e === "string" ? e : e.target.value;
    setRepo(newLink);
    const { isValid, error } = validateGitHubLink(newLink);
    setValidLink(isValid);
    setErrorMessage(error);
  };

  return { repo, validLink, errorMessage, handleLinkChange };
};
