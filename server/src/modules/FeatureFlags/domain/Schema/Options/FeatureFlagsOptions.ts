import { FilterOperator } from "../../../../Shared/Domain/QueryBuilder/FilterOperator";
import { IQueryOptions } from "../../../../Shared/Domain/QueryBuilder/IQueryOptions";
import { QueryOptions } from "../../../../Shared/Domain/Schema/TableSchema";
import { FeatureFlagsFields } from "../FeatureFlags";

export class FeatureFlagsOptions extends QueryOptions<FeatureFlagsFields> {
  byId(id: number): FeatureFlagsOptions {
    this.filters.push({ field: FeatureFlagsFields.Id, operator: FilterOperator.Equals, value: id });
    return this;
  }

  byFeatureName(featureName: string): FeatureFlagsOptions {
    this.filters.push({ field: FeatureFlagsFields.FeatureName, operator: FilterOperator.Equals, value: featureName });
    return this;
  }

  byIsEnabled(isEnabled: boolean): FeatureFlagsOptions {
    this.filters.push({ field: FeatureFlagsFields.IsEnabled, operator: FilterOperator.Equals, value: isEnabled });
    return this;
  }
}

export type FeatureFlagsQueryOptions = IQueryOptions<FeatureFlagsFields>;
