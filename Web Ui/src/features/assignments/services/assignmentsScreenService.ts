import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import { AssignmentSorting } from "../types/assignmentScreen";

export function normalizeGroupId(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function parseStoredGroupIds(rawValue: string | null): number[] {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed)
      ? parsed
          .map((groupId) => normalizeGroupId(groupId))
          .filter((groupId): groupId is number => groupId !== null)
      : [];
  } catch {
    return [];
  }
}

export function resolveInitialGroupId(params: {
  locationSearch: string;
  storedSelectedGroup: string | null;
  authGroupId: number | null | undefined;
  storedUserGroups: string | null;
  fallbackGroups: GroupDataObject[];
}): number | null {
  const groupIdFromUrl = normalizeGroupId(
    new URLSearchParams(params.locationSearch).get("groupId"),
  );

  if (groupIdFromUrl) {
    return groupIdFromUrl;
  }

  const storedSelectedGroup = normalizeGroupId(params.storedSelectedGroup);
  if (storedSelectedGroup) {
    return storedSelectedGroup;
  }

  const authGroupId = normalizeGroupId(params.authGroupId);
  if (authGroupId) {
    return authGroupId;
  }

  const firstStoredUserGroup = parseStoredGroupIds(params.storedUserGroups)[0];
  if (firstStoredUserGroup) {
    return firstStoredUserGroup;
  }

  return normalizeGroupId(params.fallbackGroups[0]?.id);
}

export function sortAssignments(
  assignments: AssignmentDataObject[],
  sorting: AssignmentSorting,
): AssignmentDataObject[] {
  const assignmentsCopy = [...assignments];

  switch (sorting) {
    case "A_Up_Order":
      return assignmentsCopy.sort((a, b) => a.title.localeCompare(b.title));
    case "A_Down_Order":
      return assignmentsCopy.sort((a, b) => b.title.localeCompare(a.title));
    case "Time_Up":
      return assignmentsCopy.sort((a, b) => b.id - a.id);
    case "Time_Down":
      return assignmentsCopy.sort((a, b) => a.id - b.id);
    default:
      return assignmentsCopy;
  }
}
