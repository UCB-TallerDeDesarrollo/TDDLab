import { Request, Response } from "express";
import { IDBJobsRepository } from "../../modules/TDDCycles/Domain/IDBJobsRepository";
import { IDBCommitsRepository } from "../../modules/TDDCycles/Domain/IDBCommitsRepository";
import { IGithubRepository } from "../../modules/TDDCycles/Domain/IGithubRepository";
import { GetTDDCyclesUseCase } from "../../modules/TDDCycles/Application/getTDDCyclesUseCase";
import { GetTestResultsUseCase } from "../../modules/TDDCycles/Application/getTestResultsUseCase";
import { PostTDDLogUseCase } from "../../modules/TDDCycles/Application/postTDDLogUseCase";
import { ITimelineEntry } from "../../modules/TDDCycles/Domain/ITimelineCommit";
import { DBCommitsRepository } from "../../modules/TDDCycles/Repositories/DBCommitsRepository";



class TDDCyclesController {
  tddCyclesUseCase: GetTDDCyclesUseCase;
  testResultsUseCase: GetTestResultsUseCase;
  submitTDDLogToDB: PostTDDLogUseCase;
  dbCommitsRepository: IDBCommitsRepository;
  constructor(
    dbCommitsRepository: IDBCommitsRepository,
    dbJobsRepository: IDBJobsRepository,
    githubRepository: IGithubRepository
  ) {
    this.tddCyclesUseCase = new GetTDDCyclesUseCase(
      dbCommitsRepository,
      githubRepository
    );
    this.testResultsUseCase = new GetTestResultsUseCase(
      dbJobsRepository,
      githubRepository
    );
    this.submitTDDLogToDB = new PostTDDLogUseCase(
      dbJobsRepository,
    );
    this.dbCommitsRepository=new DBCommitsRepository();
  }
  async getTDDCycles(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;
      if (!owner || !repoName) {
        return res
          .status(400)
          .json({ error: "Bad request, missing owner or repoName" });
      }
      const commits = await this.tddCyclesUseCase.execute(
        String(owner),
        String(repoName)
      );
      return res.status(200).json(commits);
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }
  async getTestResults(req: Request, res: Response) {
    try {
      const { owner, repoName } = req.query;
      if (!owner || !repoName) {
        return res
          .status(400)
          .json({ error: "Bad request, missing owner or repoName" });
      }
      const testResults = await this.testResultsUseCase.execute(
        String(owner),
        String(repoName)
      );
      return res.status(200).json(testResults);
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async uploadTDDLog(req: Request, res: Response) {
    
    try {
      const tddLog = req.body;
      if (!tddLog) {
        return res.status(400).json({ error: "Choquito choquito, necesito tu TDD log, no jalo de otra." });
      }
      console.log("Archivo TDD log recibido", tddLog);
      console.log("Ahora procederé a extraer los datos para insertarlos en la tabla");
      let actualCommitSha = null;
      let lastCommitIndex = 0;
      const commitTimelineEntries = [];
      //itero sobre todos los objetos del tdd log
      for (let i = 0; i < tddLog.length; i++){
        const entry = tddLog[i];
        //chequeamos si el entry es un commit entry
        if(entry.commitId){
          actualCommitSha = entry.commitId;
          //una vez encontrado el entry commit, chequeamos todos los commits anteriores, por lo que por ahora, hacemos otro for
          for(let j = lastCommitIndex; j < i; j++)
          {
            const testEntry = tddLog[j];
            if(testEntry.numPassedTests !== undefined && testEntry.numTotalTests !== undefined && testEntry.timestamp){
              const color = testEntry.numPassedTests === testEntry.numTotalTests ? "green" : "red";
              const commitTimelineEntry: ITimelineEntry = {
                execution_id: null, 
                commit_sha: actualCommitSha,
                execution_timestamp: new Date(testEntry.timestamp),
                number_of_tests: testEntry.numTotalTests,
                passed_tests: testEntry.numPassedTests,
                color: color,
              };
              commitTimelineEntries.push(commitTimelineEntry);
            } 
          }
          
          let tdd_cycle_entry;
          // aca debemos procesar commit time line entries que tiene datos de green y red
          const hasRed = commitTimelineEntries.some(entry => entry.color === "red");
          const lastIsGreen = commitTimelineEntries.length > 0 && commitTimelineEntries[commitTimelineEntries.length - 1].color === "green";
          if (hasRed && lastIsGreen) {
            console.log("Si realizó un ciclo TDD");
            tdd_cycle_entry=true;
          } else {
            console.log("No se realizó un ciclo TDD");
            tdd_cycle_entry=false;
          }
          try{
            await this.dbCommitsRepository.updateTddCycle(actualCommitSha,tdd_cycle_entry); 
          } catch (error) {
            console.error(`Error al actualizar el commit ${actualCommitSha}: ${error}`);
          }
          // podemos usarun for para definir si fue exitoso o no
          // despues insertamos en la tabla de commits tabla
          // Tiene de momento con la sha. 
          // al momento de recuperar para ver si un commit fue exitoso consultamos esa tabla usando el sha 
          lastCommitIndex = i + 1;
        }
      }
      console.log("Entradas para registrar en la BD:", commitTimelineEntries);
      await this.submitTDDLogToDB.execute(commitTimelineEntries); //anadi esta linea de codigo

      return res.status(200).json({ message: "Archivo TDD log procesado y registros creados", data: commitTimelineEntries });
    } catch (error) {
      console.error("Error al procesar el archivo TDD log:", error);
      return res.status(500).json({ error: "Error al procesar el archivo TDD log" });
    }
  }
  
  
}
export default TDDCyclesController;
