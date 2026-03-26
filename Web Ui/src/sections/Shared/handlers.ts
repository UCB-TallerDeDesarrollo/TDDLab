import { Dispatch, SetStateAction } from "react";
import { NavigateFunction, createSearchParams } from "react-router-dom";

export const createDialogHandlers = (setDialogState: Dispatch<SetStateAction<boolean>>) => {
  const openDialog = () => setDialogState(true);
  const closeDialog = () => setDialogState(false);
  return { openDialog, closeDialog };
};

export const createLinkDialogHandlers = (
  setDialogState: Dispatch<SetStateAction<boolean>>,
  onClose?: () => void
) => {
  const openDialog = () => setDialogState(true);
  const closeDialog = () => {
    setDialogState(false);
    onClose?.();
  };
  return { openDialog, closeDialog };
};

export const handleRedirectStudent = (
  link: string,
  id: number,
  navigate: NavigateFunction,
  onError?: (message: string) => void
) => {
  if (link) {
    const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
    const match = regex.exec(link);

    if (match) {
      const [, user, repo] = match;
      navigate({
        pathname: "/graph",
        search: createSearchParams({
          repoOwner: user,
          repoName: repo,
          submissionId: id.toString(),
        }).toString(),
      });
    } else {
      onError?.("Link invalido, por favor ingrese un link valido.");
    }
  } else {
    onError?.("No se encontro un link para esta tarea.");
  }
};

export const setSelectedMetric = (metric: string) => {
  localStorage.setItem("selectedMetric", metric);
  window.dispatchEvent(new Event("storage"));
};
