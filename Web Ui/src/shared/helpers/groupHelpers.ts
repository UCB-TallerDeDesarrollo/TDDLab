import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";

export function normalizeGroupId(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function uniqueGroupIds(groupIds: number[]): number[] {
  return Array.from(
    new Set(
      groupIds
        .map((groupId) => normalizeGroupId(groupId))
        .filter((groupId): groupId is number => groupId !== null),
    ),
  );
}

export function uniqueGroupsById(groups: GroupDataObject[]): GroupDataObject[] {
  return Array.from(
    groups
      .reduce((groupsById, group) => {
        const groupId = normalizeGroupId(group.id);
        if (groupId && !groupsById.has(groupId)) {
          groupsById.set(groupId, group);
        }

        return groupsById;
      }, new Map<number, GroupDataObject>())
      .values(),
  );
}
