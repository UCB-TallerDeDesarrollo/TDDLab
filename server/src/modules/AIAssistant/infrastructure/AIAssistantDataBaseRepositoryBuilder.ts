import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { IAIAssistantDataBaseRepository } from "../repository/IAIAssistantDataBaseRepository";
import { AIAssistantPromptObject } from "../domain/AIAssistant";

export class AIAssistantDataBaseRepositoryBuilder implements IAIAssistantDataBaseRepository {
  constructor(private connectionFactory: IDatabaseConnectionFactory) {}

  private async executeQuery(query: string, values?: any[]): Promise<any[]> {
    const connection: IDatabaseConnection = await this.connectionFactory.getConnection();
    try {
      const result = await connection.query(query, values);
      return result.rows;
    } finally {
      connection.release();
    }
  }

  async getPrompts(): Promise<AIAssistantPromptObject> {
    const rows = await this.executeQuery('SELECT name, prompt FROM prompts_ia_temp_v2');
    return this.mapRowsToPromptAIAssistant(rows);
  }

  async updatePrompts(prompt: AIAssistantPromptObject): Promise<AIAssistantPromptObject> {
    const entries = Object.entries(prompt);
    for (const [name, newPrompt] of entries) {
      await this.executeQuery(`UPDATE prompts_ia_temp_v2 SET prompt = $1 WHERE name = $2`, [newPrompt, name]);
    }
    return this.getPrompts();
  }

  private mapRowsToPromptAIAssistant(rows: any[]): AIAssistantPromptObject {
    const result: AIAssistantPromptObject = {};
    for (const row of rows) {
      result[row.name] = row.prompt;
    }
    return result;
  }
}
