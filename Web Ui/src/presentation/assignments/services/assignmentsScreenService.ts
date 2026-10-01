import { AssignmentDataObject } from "../../../modules/Assignments/domain/assignmentInterfaces";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";
import { normalizeGroupId } from "../../../shared/helpers/groupHelpers";
import {
  AssignmentListItemViewModel,
  AssignmentSorting,
} from "../types/assignmentScreen";

export function resolveInitialGroupId(params: {
  locationSearch: string;
  storedSelectedGroup: string | null;
  authGroupId: number | null | undefined;
  fallbackGroups: GroupDataObject[];
}): number | null {
  const availableGroupIds = new Set(
    params.fallbackGroups
      .map((group) => normalizeGroupId(group.id))
      .filter((groupId): groupId is number => groupId !== null),
  );

  const firstAvailableGroupId = normalizeGroupId(params.fallbackGroups[0]?.id);

  const resolveAvailableGroupId = (groupId: number | null) => {
    if (!groupId) {
      return null;
    }

    if (availableGroupIds.size === 0) {
      return null;
    }

    return availableGroupIds.has(groupId) ? groupId : null;
  };

  const groupIdFromUrl = normalizeGroupId(
    new URLSearchParams(params.locationSearch).get("groupId"),
  );

  const availableGroupIdFromUrl = resolveAvailableGroupId(groupIdFromUrl);
  if (availableGroupIdFromUrl) {
    return availableGroupIdFromUrl;
  }

  const storedSelectedGroup = normalizeGroupId(params.storedSelectedGroup);
  const availableStoredSelectedGroup = resolveAvailableGroupId(storedSelectedGroup);
  if (availableStoredSelectedGroup) {
    return availableStoredSelectedGroup;
  }

  const authGroupId = normalizeGroupId(params.authGroupId);
  const availableAuthGroupId = resolveAvailableGroupId(authGroupId);
  if (availableAuthGroupId) {
    return availableAuthGroupId;
  }

  return firstAvailableGroupId;
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
