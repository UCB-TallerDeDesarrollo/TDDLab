import { AIAssistantRepository } from './src/modules/AIAssistant/repository/AIAssistantRepositoy';
async function run() {
  const repo = new AIAssistantRepository();
  const res = await repo.sendChat("historia", "hola");
  console.log("RESULT:", res);
}
run();
