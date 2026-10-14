type SubmissionStatus =  "pending" | "in progress" | "delivered";
export interface SubmissionCreationObject{
    assignmentid: number;
    userid: number;
    status: SubmissionStatus;
    repository_link: string;
    start_date: Date | null;
}

export interface SubmissionDataObject{
    id: number
    assignmentid: number;
    userid: number;
    status: SubmissionStatus;
    repository_link: string;
    start_date: Date | null;
    end_date: Date | null;
    comment: string | null;
}

export interface SubmissionUpdateObject{
  repository_link?: string;
    status: SubmissionStatus;
    end_date: Date | null;
    comment: string | null;
}

export function validateSubmissionRepositoryLink(id: number, userid: number, repositoryLink: unknown): asserts repositoryLink is string {
  if (!Number.isInteger(id) || id <= 0 || !Number.isInteger(userid) || userid <= 0) {
    throw new TypeError("Identificador invalido.");
  }
  if (typeof repositoryLink !== "string" ||
      !/^https:\/\/github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\/[A-Za-z0-9_.-]+\/?$/.test(repositoryLink) ||
      /\.git\/?$/.test(repositoryLink) ||
      [".", ".."].includes(repositoryLink.split("/")[4])) {
    throw new TypeError("Enlace invalido. Formato esperado: https://github.com/usuario/repositorio");
  }
}
