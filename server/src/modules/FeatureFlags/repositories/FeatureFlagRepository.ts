import { Pool } from "pg";
import config from "../../../config/db";
import {
  FeatureFlagDataObject,
  FeatureFlagCreationObject,
  FeatureFlagUpdateObject,
} from "../domain/FeatureFlag";

interface QueryResult {
  exists: boolean;
}

const pool = new Pool(config);

class FeatureFlagRepository {
  public async executeQuery(query: string, values?: any[]): Promise<any[]> {
    const client = await pool.connect();
    try {
      const result = await client.query(query, values);
      return result.rows;
    } finally {
      client.release();
    }
  }

  public mapRowToFeatureFlag(row: any): FeatureFlagDataObject {
    return {
      id: row.id,
      feature_name: row.feature_name,
      is_enabled: row.is_enabled,
    };
  }

  async checkDuplicateFeatureName(feature_name: string): Promise<boolean> {
    const query = "SELECT EXISTS (SELECT 1 FROM feature_flags WHERE LOWER(feature_name) = LOWER($1))";
    const result: QueryResult[] = await this.executeQuery(query, [feature_name]);
    return result[0].exists;
  }

  async obtainFeatureFlags(): Promise<FeatureFlagDataObject[]> {
    const query = "SELECT id, feature_name, is_enabled FROM feature_flags";
    const rows = await this.executeQuery(query);
    return rows.map((row) => this.mapRowToFeatureFlag(row));
  }

  async obtainFeatureFlagById(id: number): Promise<FeatureFlagDataObject | null> {
    const query = "SELECT id, feature_name, is_enabled FROM feature_flags WHERE id = $1";
    const rows = await this.executeQuery(query, [id]);
    if (rows.length === 0) {
      return null;
    }
    return this.mapRowToFeatureFlag(rows[0]);
  }

  async obtainFeatureFlagByName(feature_name: string): Promise<FeatureFlagDataObject | null> {
    const query = "SELECT id, feature_name, is_enabled FROM feature_flags WHERE feature_name = $1";
    const rows = await this.executeQuery(query, [feature_name]);
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

    const query = "INSERT INTO feature_flags (feature_name, is_enabled) VALUES ($1, $2) RETURNING *";
    const values = [featureFlag.feature_name, featureFlag.is_enabled];
    const rows = await this.executeQuery(query, values);
    return this.mapRowToFeatureFlag(rows[0]);
  }

  async updateFeatureFlag(id: number, featureFlag: FeatureFlagUpdateObject): Promise<FeatureFlagDataObject | null> {
    // Check if feature flag exists
    const existingFeatureFlag = await this.obtainFeatureFlagById(id);
    if (!existingFeatureFlag) {
      return null;
    }

    // If updating feature_name, check for duplicates
    if (featureFlag.feature_name && featureFlag.feature_name !== existingFeatureFlag.feature_name) {
      const duplicateExists = await this.checkDuplicateFeatureName(featureFlag.feature_name);
      if (duplicateExists) {
        throw new Error("Feature flag with this name already exists");
      }
    }

    // Build update query dynamically based on provided fields
    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (featureFlag.feature_name !== undefined) {
      updateFields.push(`feature_name = $${paramIndex}`);
      values.push(featureFlag.feature_name);
      paramIndex++;
    }

    if (featureFlag.is_enabled !== undefined) {
      updateFields.push(`is_enabled = $${paramIndex}`);
      values.push(featureFlag.is_enabled);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return existingFeatureFlag; // Nothing to update
    }

    values.push(id); // Add id as the last parameter
    const query = `UPDATE feature_flags SET ${updateFields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const rows = await this.executeQuery(query, values);
    return this.mapRowToFeatureFlag(rows[0]);
  }

  async deleteFeatureFlag(id: number): Promise<boolean> {
    const query = "DELETE FROM feature_flags WHERE id = $1 RETURNING *";
    const rows = await this.executeQuery(query, [id]);
    return rows.length > 0;
  }
}

export default FeatureFlagRepository;