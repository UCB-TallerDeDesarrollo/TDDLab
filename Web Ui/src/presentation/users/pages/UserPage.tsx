import useUsersPage from "../hooks/useUsersPage";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";
import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
import FeatureSectionDivider from "../../../shared/components/FeatureSectionDivider";
import FeatureListSection from "../../../shared/components/FeatureListSection";
import ContentState from "../../../shared/components/ContentState";

import UsersHeader from "../components/UsersHeader";
import UsersTable from "../components/UsersTable";

import { ValidationDialog } from "../components/dialogs/ValidationDialog";
import { ConfirmationDialog } from "../components/dialogs/ConfirmationDialog";

function UserPage() {
  const {
    groups,
    selectedGroup,
    searchQuery,
    filteredUsers,
    loading,
    error,
    groupMap,
    handleGroupValueChange,
    handleSearchQueryChange,
    openRemoveDialog,
    confirmRemoveUser,
    closeRemoveDialog,
    isRemoveDialogOpen,
    isFeedbackDialogOpen,
    feedbackMessage,
    closeFeedbackDialog,
  } = useUsersPage();

  let usersContent = <ContentState variant="loading" title="Cargando..." />;

  if (error) {
    usersContent = (
      <ContentState
        variant="error"
        title="Error al cargar..."
        description="Hubo un problema al cargar los usuarios."
      />
    );
  } else if (loading === false && filteredUsers.length === 0) {
    usersContent = (
      <ContentState
        variant="empty"
        title="No se encontraron resultados"
        description="No hay usuarios que coincidan con los filtros actuales."
      />
    );
  } else if (loading === false) {
    usersContent = (
      <UsersTable
        users={filteredUsers}
        groupMap={groupMap}
        onRemove={openRemoveDialog}
      />
    );
  }

  return (
    <FeatureScreenLayout className="users-page" sectionGap={0}>
      <FeaturePageHeader
        title="Usuarios"
        actions={
          <UsersHeader
            groups={groups}
            selectedGroup={selectedGroup}
            searchQuery={searchQuery}
            onGroupChange={handleGroupValueChange}
            onSearchChange={handleSearchQueryChange}
          />
        }
      />
      <FeatureSectionDivider />

      <FeatureListSection>{usersContent}</FeatureListSection>

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
    </FeatureScreenLayout>
  );
}

export default UserPage;
