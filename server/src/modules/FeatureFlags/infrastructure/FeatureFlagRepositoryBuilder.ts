import { IDatabaseConnection, IDatabaseConnectionFactory } from "../../Shared/Domain/IDatabaseConnectionFactory";
import { FeatureFlagsSchema } from "../domain/Schema/FeatureFlags";
import { FeatureFlagsOptions } from "../domain/Schema/Options/FeatureFlagsOptions";
import { queryBuilderFactory } from "../../Shared/Infrastructure/QueryBuilder/QueryBuilderFactory";
import { IFeatureFlagRepository } from "../domain/IFeatureFlagRepository";
import { FeatureFlagDataObject, FeatureFlagCreationObject, FeatureFlagUpdateObject } from "../domain/FeatureFlag";

export class FeatureFlagRepositoryBuilder implements IFeatureFlagRepository {
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

  private mapRowToFeatureFlag(row: any): FeatureFlagDataObject {
    return {
      id: row.id,
      feature_name: row.feature_name,
      is_enabled: row.is_enabled,
    };
  }

  async checkDuplicateFeatureName(feature_name: string): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM feature_flags WHERE LOWER(feature_name) = LOWER($1))";
    const result = await this.executeQuery(query, [feature_name]);
    return result[0].exists;
  }

  async obtainFeatureFlags(): Promise<FeatureFlagDataObject[]> {
    const { query, params } = queryBuilderFactory
      .create(FeatureFlagsSchema)
      .select()
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.map((row) => this.mapRowToFeatureFlag(row));
  }

  async obtainFeatureFlagById(id: number): Promise<FeatureFlagDataObject | null> {
    const { query, params } = queryBuilderFactory
      .create(FeatureFlagsSchema)
      .select()
      .where(new FeatureFlagsOptions().byId(id))
      .limit(1)
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length === 0) {
      return null;
    }
    return this.mapRowToFeatureFlag(rows[0]);
  }

  async obtainFeatureFlagByName(feature_name: string): Promise<FeatureFlagDataObject | null> {
    const { query, params } = queryBuilderFactory
      .create(FeatureFlagsSchema)
      .select()
      .where(new FeatureFlagsOptions().byFeatureName(feature_name))
      .limit(1)
      .build();

    const rows = await this.executeQuery(query, params);
    if (rows.length === 0) {
      return null;
    }
    return this.mapRowToFeatureFlag(rows[0]);
  }

  async createFeatureFlag(featureFlag: FeatureFlagCreationObject): Promise<FeatureFlagDataObject> {
    const duplicateExists = await this.checkDuplicateFeatureName(featureFlag.feature_name);
    if (duplicateExists) {
      throw new Error("Feature flag with this name already exists");
    }

    const { query, params } = queryBuilderFactory
      .create(FeatureFlagsSchema)
      .insert(featureFlag)
      .build();

    const rows = await this.executeQuery(query, params);
    return this.mapRowToFeatureFlag(rows[0]);
  }

  async updateFeatureFlag(id: number, featureFlag: FeatureFlagUpdateObject): Promise<FeatureFlagDataObject | null> {
    const existingFeatureFlag = await this.obtainFeatureFlagById(id);
    if (!existingFeatureFlag) {
      return null;
    }

    if (featureFlag.feature_name && featureFlag.feature_name !== existingFeatureFlag.feature_name) {
      const duplicateExists = await this.checkDuplicateFeatureName(featureFlag.feature_name);
      if (duplicateExists) {
        throw new Error("Feature flag with this name already exists");
      }
    }

    const updateData: Record<string, any> = {};
    if (featureFlag.feature_name !== undefined) updateData.feature_name = featureFlag.feature_name;
    if (featureFlag.is_enabled !== undefined) updateData.is_enabled = featureFlag.is_enabled;

    if (Object.keys(updateData).length === 0) {
      return existingFeatureFlag;
    }

    const { query, params } = queryBuilderFactory
      .create(FeatureFlagsSchema)
      .update(updateData)
      .where(new FeatureFlagsOptions().byId(id))
      .build();

    const rows = await this.executeQuery(query, params);
    return this.mapRowToFeatureFlag(rows[0]);
  }

  async deleteFeatureFlag(id: number): Promise<boolean> {
    const { query, params } = queryBuilderFactory
      .create(FeatureFlagsSchema)
      .delete()
      .where(new FeatureFlagsOptions().byId(id))
      .build();

    const rows = await this.executeQuery(query, params);
    return rows.length > 0;
  }
}
