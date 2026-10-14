import SubmissionRepository from "../Repository/SubmissionsRepository";
import { SubmissionUpdateObject, SubmissionDataObject } from "../Domain/Submission";

class UpdateSubmission {
  private readonly repository: SubmissionRepository;

  constructor(repository: SubmissionRepository) {
    this.repository = repository;
  }

  async updateRepositoryLink(id: number, userid: number, repositoryLink: string): Promise<SubmissionDataObject | null> {
    this.validateRepositoryLink(id, userid, repositoryLink);
    return this.repository.updateRepositoryLink(id, userid, repositoryLink);
  }

  private validateRepositoryLink(id: number, userid: number, repositoryLink: string): void {
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

  async finishWithRepositoryLink(id: number, userid: number, data: SubmissionUpdateObject) {
    this.validateRepositoryLink(id, userid, data.repository_link as string);
    if (data.status !== "delivered") throw new TypeError("La entrega debe finalizarse.");
    return this.repository.UpdateSubmission(id, data, userid);
  }

  async execute(
    submissionid: number,
    updatedSubmission: SubmissionUpdateObject
  ): Promise<SubmissionDataObject | null> {
    try {
      const updatedSubmissionResult = await this.repository.UpdateSubmission(
        submissionid,
        updatedSubmission
      );
      return updatedSubmissionResult;
    } catch (error) {
      console.error("Error updating Submission");
      throw error;
    }
  }
}

export default UpdateSubmission;
