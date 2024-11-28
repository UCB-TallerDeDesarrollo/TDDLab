import { IDBJobsRepository } from "../Domain/IDBJobsRepository";

export class GetCommitTimeLineUseCase {
  private readonly dbJobRepository: IDBJobsRepository;

  constructor(dbJobRepository: IDBJobsRepository) {
    this.dbJobRepository = dbJobRepository;
  }
  
  async execute(sha: string, owner: string, repo: string): Promise<any[]> {
    try {
      console.log("I am inside the execute of the get commit time line use case");
      const result = await this.dbJobRepository.getCommitExecutions(sha, owner, repo);
      console.log("This is the result from the repository:", result);
      return result;
    } catch (error) {
      console.error("Error al consultar la base de datos, el sha no existe o pasó algo más", error);
      throw error;
    }
  }
}
