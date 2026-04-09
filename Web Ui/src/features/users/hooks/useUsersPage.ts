import { useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material";

import { UserDataObject } from "../../../modules/Users/domain/UsersInterface";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";

import {
  getUsersService,
  getGroupsService,
  searchUsersByEmailService,
  removeUserFromGroupService,
} from "../services/users.service";

function useUsersPage() {
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | "all">("all");
  const [searchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [filteredUsers, setFilteredUsers] = useState<UserDataObject[]>([]);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userData, groupData] = await Promise.all([
        getUsersService(),
        getGroupsService(),
      ]);

      setFilteredUsers(userData);
      setGroups(groupData);
    } catch (fetchError) {
      console.error("Error fetching users or groups:", fetchError);
      setError(fetchError);
    } finally {
      setLoading(false);
    }
  };

  const runSearch = async (groupValue: number | "all", queryValue: string) => {
    try {
      const results = await searchUsersByEmailService(
        queryValue,
        groupValue
      );

      setFilteredUsers(results);
    } catch (searchError) {
      console.error("Error searching users:", searchError);
      setError(searchError);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    runSearch(selectedGroup, searchQuery);
  }, [selectedGroup, searchQuery]);

  const groupMap = groups.reduce((acc, group) => {
    acc[group.id] = group.groupName;
    return acc;
  }, {} as Record<number, string>);

  const handleGroupChange = (event: SelectChangeEvent<number | "all">) => {
    setSelectedGroup(event.target.value as number | "all");
  };

  const handleGroupValueChange = (value: number | "all") => {
    setSelectedGroup(value);
  };

  const openRemoveDialog = (userId: number) => {
    setSelectedUserId(userId);
    setIsRemoveDialogOpen(true);
  };

  const closeRemoveDialog = () => {
    setSelectedUserId(null);
    setIsRemoveDialogOpen(false);
  };

  const closeFeedbackDialog = () => {
    setFeedbackMessage("");
    setIsFeedbackDialogOpen(false);
  };

  const confirmRemoveUser = async () => {
    if (!selectedUserId) return;

    try {
      await removeUserFromGroupService(selectedUserId);

      closeRemoveDialog();
      setFeedbackMessage("Estudiante eliminado con éxito del grupo.");
      setIsFeedbackDialogOpen(true);

      await runSearch(selectedGroup, searchQuery);
    } catch (removeError) {
      console.error(removeError);
      closeRemoveDialog();
      setFeedbackMessage("Hubo un error al eliminar al estudiante del grupo.");
      setIsFeedbackDialogOpen(true);
    }
  };

  return {
    groups,
    selectedGroup,
    filteredUsers,
    loading,
    error,
    groupMap,
    isRemoveDialogOpen,
    isFeedbackDialogOpen,
    feedbackMessage,
    handleGroupChange,
    handleGroupValueChange,
    openRemoveDialog,
    closeRemoveDialog,
    closeFeedbackDialog,
    confirmRemoveUser,
  };
}

export default useUsersPage;