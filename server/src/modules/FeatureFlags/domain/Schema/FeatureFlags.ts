import { TableSchema } from "../../../Shared/Domain/Schema/TableSchema";

export enum FeatureFlagsFields {
  Id = 'id',
  FeatureName = 'feature_name',
  IsEnabled = 'is_enabled',
}

export const FeatureFlagsSchema = new TableSchema(
  'feature_flags',
  {
    [FeatureFlagsFields.Id]: 'id',
    [FeatureFlagsFields.FeatureName]: 'feature_name',
    [FeatureFlagsFields.IsEnabled]: 'is_enabled',
  },
  FeatureFlagsFields
);
