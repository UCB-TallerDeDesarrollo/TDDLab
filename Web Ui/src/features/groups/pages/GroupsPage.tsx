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
    handleGroupCreated,
    handleGroupUpdated,
    selectAndSync,
  } = useGroupsData();

  // 🔹 CREATE
  const [createOpen, setCreateOpen] = useState(false);

  // 🔹 EDIT
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
                onCopy={(id) => copyTeacherLink(id)}
                onLink={(id) => copyStudentLink(id)}
                onParticipants={(id) => {
                  selectAndSync(id);
                  goToParticipants(id, navigate);
                }}
                onTasks={(id) => navigate(`/tareas?groupId=${id}`)}
                onDelete={(index) => deleteGroupItem(index)}
                onEdit={(group) => {
                  selectAndSync(group.id); // ✅ mejora pro
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
        onCreated={(g) => {
          handleGroupCreated({
            id: g.id,
            name: g.groupName,
            creationDate: g.creationDate ?? new Date(),
          });
          setCreateOpen(false); // ✅ cerrar modal
        }}
      />

      {/* EDIT */}
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
        onUpdated={(g) => {
          handleGroupUpdated({
            id: g.id,
            name: g.groupName,
            creationDate: g.creationDate,
          });
          setEditOpen(false); // ✅ cerrar modal
        }}
      />

    </FeatureScreenLayout>
  );
}

export default GroupsPage;