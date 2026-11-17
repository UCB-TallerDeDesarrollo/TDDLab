import { BranchSupportRepository } from "../modules/BranchSupport/Repositories/BranchSupportRepository";

async function main() {
  console.log("Initializing Branch Support schema in Neon PostgreSQL...");
  const repository = new BranchSupportRepository();
  try {
    await repository.initSchema();
    console.log("Branch Support tables, triggers, and indexes created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to initialize schema:", err);
    process.exit(1);
  }
}

main();
