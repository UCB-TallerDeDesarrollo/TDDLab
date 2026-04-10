import { CircularProgress } from "@mui/material";
import useUsersPage from "../hooks/useUsersPage";

import UsersHeader from "../components/UserHeader";
import UsersTable from "../components/UsersTable";
import UsersDivider from "../components/UsersDivider";

import { ConfirmationDialog } from "../../../sections/Shared/Components/ConfirmationDialog";
import { ValidationDialog } from "../../../sections/Shared/Components/ValidationDialog";

function UserPage() {
  const {
    groups,
    selectedGroup,
    filteredUsers,
    loading,
    error,
    groupMap,
    handleGroupValueChange,
    openRemoveDialog,
    confirmRemoveUser,
    closeRemoveDialog,
    isRemoveDialogOpen,
    isFeedbackDialogOpen,
    feedbackMessage,
    closeFeedbackDialog,
  } = useUsersPage();

  if (loading) return <CircularProgress />;
  if (error) return <div>Error</div>;

  return (
    <>
      <UsersHeader
        groups={groups}
        selectedGroup={selectedGroup}
        onGroupChange={handleGroupValueChange}
      />

      <UsersDivider />

      <UsersTable
        users={filteredUsers}
        groupMap={groupMap}
        onRemove={openRemoveDialog}
      />

      <ConfirmationDialog
        open={isRemoveDialogOpen}
        title="Confirmar eliminación"
        content="¿Eliminar usuario del grupo?"
        cancelText="Cancelar"
        deleteText="Eliminar"
        onCancel={closeRemoveDialog}
        onDelete={confirmRemoveUser}
      />

      <ValidationDialog
        open={isFeedbackDialogOpen}
        title={feedbackMessage}
        closeText="Cerrar"
        onClose={closeFeedbackDialog}
      />
    </>
  );
}

export default UserPage;