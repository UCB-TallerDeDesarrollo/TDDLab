import { useState } from "react";

interface UseGitHubLinkValidation {
  repo: string;
  validLink: boolean;
  handleLinkChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
}

export const useGitHubLinkValidation = (
  initialRepo: string | undefined
): UseGitHubLinkValidation => {
  const [repo, setRepo] = useState(initialRepo || "");
  const [validLink, setValidLink] = useState(true);

  const validateGitHubLink = (text: string): boolean => {
    const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
    return regex.test(text);
  };

  const handleLinkChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const newLink = typeof e === "string" ? e : e.target.value;
    setRepo(newLink);
    setValidLink(validateGitHubLink(newLink));
  };

  return { repo, validLink, handleLinkChange };
};
