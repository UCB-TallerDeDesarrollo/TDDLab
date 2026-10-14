import PracticeSubmissionRepository from "../Repository/PracticeSubmissionsRepository";
import { PracticeSubmissionUpdateObject, PracticeSubmissionDataObject } from "../Domain/PracticeSubmission";

class UpdatePracticeSubmission {
  private readonly repository: PracticeSubmissionRepository;

  constructor(repository: PracticeSubmissionRepository) {
    this.repository = repository;
  }

  async updateRepositoryLink(id: number, userid: number, repositoryLink: string): Promise<PracticeSubmissionDataObject | null> {
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

  async finishWithRepositoryLink(id: number, userid: number, data: PracticeSubmissionUpdateObject) {
    this.validateRepositoryLink(id, userid, data.repository_link as string);
    if (data.status !== "delivered") throw new TypeError("La entrega debe finalizarse.");
    return this.repository.UpdatePracticeSubmission(id, data, userid);
  }

  async execute(
    practiceSubmissionid: number,
    updatedPracticeSubmission: PracticeSubmissionUpdateObject
  ): Promise<PracticeSubmissionUpdateObject | null> {
    try {
      const updatedPracticeSubmissionResult = await this.repository.UpdatePracticeSubmission(
        practiceSubmissionid,
        updatedPracticeSubmission
      );
      return updatedPracticeSubmissionResult;
    } catch (error) {
      console.error("Error updating Practice Submission");
      throw error;
    }
  }
}

export default UpdatePracticeSubmission;
