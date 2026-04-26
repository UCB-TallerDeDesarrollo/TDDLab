import { useState } from "react";
import { useNavigate } from "react-router-dom";

import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";
import FeatureSectionDivider from "../../../shared/components/FeatureSectionDivider";
import FeatureListSection from "../../../shared/components/FeatureListSection";
import ContentState from "../../../shared/components/ContentState";
import SortingComponent from "../../../shared/components/SortingComponent";

import { GroupsList } from "../components/GroupsList";
import { useGroupsData } from "../hooks/useGroupsData";

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

  return (
    <FeatureScreenLayout className="groups-page">
      <div className="groups-content-shell">

        {/* HEADER */}
        <FeaturePageHeader
          title="Grupos"
          actions={
            <>
              <SortingComponent
                selectedSorting={selectedSorting}
                onChangeHandler={handleGroupsOrder}
              />

              <button
                className="create-group-btn"
                onClick={() => setCreateOpen(true)}
              >
                Crear Grupo
              </button>
            </>
          }
        />

        <FeatureSectionDivider />

        {/* STATES */}
        {loading && (
          <ContentState
            variant="loading"
            title="Cargando grupos..."
          />
        )}

        {error && (
          <ContentState
            variant="error"
            title="Error al cargar los grupos"
            description="Intenta nuevamente más tarde"
          />
        )}

        {/* LISTA */}
        {!loading && !error && (
          <FeatureListSection>
            {groups.length === 0 ? (
              <div className="groups-center-state">
                <ContentState
                  variant="empty"
                  title="No hay grupos disponibles"
                  description="Crea tu primer grupo para comenzar"
                />
              </div>
            ) : (
              <GroupsList
                groups={groups}
                onCopy={copyTeacherLink}
                onLink={copyStudentLink}
                onParticipants={(id) => {
                  selectAndSync(id);
                  goToParticipants(id, navigate);
                }}
                onTasks={(id) => navigate(`/tareas?groupId=${id}`)}
                onDelete={deleteGroupItem}
                onEdit={(group) => {
                  selectAndSync(group.id);
                  setGroupToEdit(group);
                  setEditOpen(true);
                }}
              />
            )}
          </FeatureListSection>
        )}
      </div>

      {/* CREATE */}
      <CreateGroupPopup
  open={createOpen}
  handleClose={() => setCreateOpen(false)}
  onCreate={async (data) => {
    await createGroup(data);
    setCreateOpen(false);
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
          groupDetail: "",
          creationDate: groupToEdit.creationDate ?? new Date(),
        }
      : null
  }
  onUpdate={async (data) => {
    await updateGroup(data);
    setEditOpen(false);
  }}
/>
    </FeatureScreenLayout>
  );
}

export default GroupsPage;