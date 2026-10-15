import { Dispatch, SetStateAction } from "react";
import { NavigateFunction, createSearchParams } from "react-router-dom";
import { parseGithubRepositoryUrl } from "./githubRepository";

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
  const repository = parseGithubRepositoryUrl(link);
  if (!repository) {
    if (link) {
      onError?.("Link invalido, por favor ingrese un link valido.");
    } else {
      onError?.("No se encontro un link para esta tarea.");
    }
    return;
  }

  navigate({
    pathname: "/graph",
    search: createSearchParams({
      repoOwner: repository.owner,
      repoName: repository.repoName,
      submissionId: id.toString(),
    }).toString(),
  });
};

export const handleRedirectToTasks = (groupId: number, navigate: NavigateFunction) => {
  navigate(`/tareas?groupId=${groupId}`);
};

export const setSelectedMetric = (metric: string) => {
  localStorage.setItem("selectedMetric", metric);
  globalThis.dispatchEvent(new Event("storage"));
};
