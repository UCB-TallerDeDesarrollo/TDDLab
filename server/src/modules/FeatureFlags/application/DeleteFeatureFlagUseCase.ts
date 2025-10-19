import FeatureFlagRepository from "../repositories/FeatureFlagRepository";

class DeleteFeatureFlag {
  private readonly repository: FeatureFlagRepository;

  constructor(repository: FeatureFlagRepository) {
    this.repository = repository;
  }

  async execute(id: number): Promise<boolean> {
    try {
      // Validar que el ID sea válido
      if (!id || id <= 0) {
        throw new Error("Invalid feature flag ID");
      }

      const result = await this.repository.deleteFeatureFlag(id);
      if (!result) {
        throw new Error(`Feature flag with id ${id} not found`);
      }
      return true;
    } catch (error) {
      console.error(`Error deleting feature flag with id ${id}.`, error);
      throw error;
    }
  }
}

export default DeleteFeatureFlag;