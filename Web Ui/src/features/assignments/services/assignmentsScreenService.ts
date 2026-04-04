import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import {
  AssignmentListItemViewModel,
  AssignmentSorting,
} from "../types/assignmentScreen";

export function normalizeGroupId(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function resolveInitialGroupId(params: {
  locationSearch: string;
  storedSelectedGroup: string | null;
  authGroupId: number | null | undefined;
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

  return normalizeGroupId(params.fallbackGroups[0]?.id);
}

export function resolveStudentGroupIds(
  userGroupid: number | number[],
): number[] {
  if (Array.isArray(userGroupid)) {
    return userGroupid
      .map((groupId) => normalizeGroupId(groupId))
      .filter((groupId): groupId is number => groupId !== null);
  }

  const normalizedGroupId = normalizeGroupId(userGroupid);
  return normalizedGroupId ? [normalizedGroupId] : [];
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

export function buildAssignmentListItems(
  assignments: AssignmentDataObject[],
  groups: GroupDataObject[],
): AssignmentListItemViewModel[] {
  const groupsById = new Map(
    groups.map((group) => [group.id, group.groupName] as const),
  );

  return assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    groupName: groupsById.get(assignment.groupid) ?? "",
    state: assignment.state,
  }));
}
