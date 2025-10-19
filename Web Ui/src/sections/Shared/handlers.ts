import { Dispatch, SetStateAction } from "react";
import { NavigateFunction, createSearchParams } from "react-router-dom";

export const createDialogHandlers = (setDialogState: Dispatch<SetStateAction<boolean>>) => {
  const openDialog = () => setDialogState(true);
  const closeDialog = () => setDialogState(false);
  return { openDialog, closeDialog };
};

export const createLinkDialogHandlers = (
  setDialogState: Dispatch<SetStateAction<boolean>>
) => {
  const openDialog = () => setDialogState(true);
  const closeDialog = () => {
    setDialogState(false);
    window.location.reload();
  };
  return { openDialog, closeDialog };
};

export const handleRedirectStudent = (
  link: string,
  id : number,
  navigate: NavigateFunction
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
      console.log("No entra");
      alert("Link Inválido, por favor ingrese un link válido.");
    }
  } else {
    alert("No se encontró un link para esta tarea.");
  }
};