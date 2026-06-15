import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";
import FeatureSectionDivider from "../../../shared/components/FeatureSectionDivider";
import FeatureListSection from "../../../shared/components/FeatureListSection";
import ContentState from "../../../shared/components/ContentState";
import SortingComponent from "../../../shared/components/SortingComponent";
import ActionButton from "../../../shared/components/ActionButton";
import ConfirmationDialog from "../../../shared/components/ConfirmationDialog";

import { GroupsList } from "../components/GroupsList";
import { useGroupsData } from "../hooks/useGroupsData";
import { handleRedirectToTasks } from "../../../shared/helpers/navigationHandlers";

import CreateGroupPopup from "../components/GroupsForm";
import EditGroupPopup from "../components/EditGroupForm";

import { Group } from "../types";

import "./GroupsPage.css";

function GroupsPage() {
  const navigate = useNavigate();

  const {
    groups,
    loading,
    error,
    selectedSorting,
    handleGroupsOrder,
    deleteGroupItem,
    copyTeacherLink,
    copyStudentLink,
    goToParticipants,
    createGroup,
    updateGroup,
    selectAndSync,
  } = useGroupsData();

  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState<Group | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<{
    group: Group;
    index: number;
  } | null>(null);

  const handleCloseDeleteDialog = () => {
    setGroupToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) {
      return;
    }

    await deleteGroupItem(groupToDelete.index);
    setGroupToDelete(null);
  };

  const renderContent = () => {
    if (loading) {
      return <ContentState variant="loading" title="Cargando..." />;
    }
    if (error) {
      return (
        <ContentState
          variant="error"
          title="Error al cargar..."
          description="Intenta nuevamente más tarde"
        />
      );
    }
    if (groups.length === 0) {
      return (
        <ContentState
          variant="empty"
          title="Sin resultados"
          description="Crea tu primer grupo para comenzar"
        />
      );
    }
    return (
      <GroupsList
        groups={groups}
        onCopy={copyTeacherLink}
        onLink={copyStudentLink}
        onParticipants={(id) => {
          selectAndSync(id);
          goToParticipants(id, navigate);
        }}
        onTasks={(id) => handleRedirectToTasks(id, navigate)}
        onDelete={(index) => {
          const group = groups[index];
          if (group) {
            setGroupToDelete({ group, index });
          }
        }}
        onEdit={(group) => {
          selectAndSync(group.id);
          setGroupToEdit(group);
          setEditOpen(true);
        }}
      />
    );
  };

  return (
    <FeatureScreenLayout className="groups-page" sectionGap={0}>
      <div className="groups-content-shell">
        <FeaturePageHeader
          title="Grupos"
          actions={
            <>
              <SortingComponent
                selectedSorting={selectedSorting}
                onChangeHandler={handleGroupsOrder}
                prototypeStyle
                placeholderText="Filtrar"
              />

              <ActionButton
                startIcon={<AddIcon />}
                variantStyle="primary"
                onClick={() => setCreateOpen(true)}
              >
                Crear
              </ActionButton>
            </>
          }
        />

        <FeatureSectionDivider />

        <FeatureListSection>
          {renderContent()}
        </FeatureListSection>
      </div>

      {/* CREATE */}
      <CreateGroupPopup
        open={createOpen}
        handleClose={() => setCreateOpen(false)}
        onCreate={async (data) => {
          await createGroup(data);
        }}
      />

      <EditGroupPopup
        open={editOpen}
        handleClose={() => setEditOpen(false)}
        groupToEdit={
          groupToEdit
            ? {
                id: groupToEdit.id,
                groupName: groupToEdit.name,
                groupDetail: groupToEdit.description ?? "",
                creationDate: groupToEdit.creationDate ?? new Date(),
              }
            : null
        }
        onUpdate={async (data) => {
          await updateGroup(data);
        }}
      />

      <ConfirmationDialog
        open={Boolean(groupToDelete)}
        title="Eliminar grupo"
        content={
          groupToDelete
            ? `Estas seguro de eliminar el grupo "${groupToDelete.group.name}"? Esta accion tambien quitara sus tareas asociadas.`
            : ""
        }
        cancelText="Cancelar"
        deleteText="Eliminar"
        onCancel={handleCloseDeleteDialog}
        onDelete={handleConfirmDelete}
      />
    </FeatureScreenLayout>
  );
}

export default GroupsPage;
