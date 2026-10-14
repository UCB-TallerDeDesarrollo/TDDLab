import { Dispatch, SetStateAction } from "react";
import { NavigateFunction, createSearchParams } from "react-router-dom";
import type { TeacherSubmission } from "../types/teacherSubmission";

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

export const handleRedirectToTasks = (groupId: number, navigate: NavigateFunction) => {
  navigate(`/tareas?groupId=${groupId}`);
};

export const setSelectedMetric = (metric: string) => {
  localStorage.setItem("selectedMetric", metric);
  globalThis.dispatchEvent(new Event("storage"));
};

export const getTeacherSubmissionsKey = (assignmentId: number) =>
  `teacherSubmissions:${assignmentId}`;

export const saveTeacherSubmissions = (
  assignmentId: number,
  submissions: TeacherSubmission[],
) => {
  if (!assignmentId || assignmentId <= 0) {
    return;
  }

  sessionStorage.setItem(getTeacherSubmissionsKey(assignmentId), JSON.stringify(submissions));
};

function isTeacherSubmission(value: unknown): value is TeacherSubmission {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const submission = value as Record<string, unknown>;
  const id = submission.id;
  const repositoryLink = submission.repository_link;
  return (
    typeof id === "number" &&
    Number.isInteger(id) &&
    id > 0 &&
    typeof repositoryLink === "string" &&
    repositoryLink.trim().length > 0
  );
}

export const readTeacherSubmissions = (assignmentId: number): TeacherSubmission[] => {
  if (!assignmentId || assignmentId <= 0) {
    return [];
  }

  try {
    const rawValue = sessionStorage.getItem(getTeacherSubmissionsKey(assignmentId));
    if (!rawValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue) || !parsedValue.every(isTeacherSubmission)) {
      console.error(
        `Invalid teacher submissions data in session storage for assignment ${assignmentId}.`,
      );
      return [];
    }

    return parsedValue;
  } catch (error) {
    console.error("Error reading teacher submissions from session storage:", error);
    return [];
  }
};
