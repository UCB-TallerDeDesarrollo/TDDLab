import { IDBJobsRepository } from "../Domain/IDBJobsRepository";

export class GetCommitTimeLineUseCase {
  private readonly dbJobRepository: IDBJobsRepository;

  constructor(dbJobRepository: IDBJobsRepository) {
    this.dbJobRepository = dbJobRepository;
  }
  
  async execute(sha: string, owner: string, repo: string) {
    try {
      await this.dbJobRepository.getCommitExecutions(sha, owner, repo);
    } catch (error) {
      console.error("Error al consultar la base de datos, el sha no existe o pasó algo más", error);
      throw error;
    }
  }
}
