import { useNavigate } from "react-router-dom";

import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";
import FeatureSectionDivider from "../../../shared/components/FeatureSectionDivider";
import FeatureListSection from "../../../shared/components/FeatureListSection";
import ContentState from "../../../shared/components/ContentState";
import SortingComponent from "../../../shared/components/SortingComponent";

import { GroupsList } from "../components/GroupsList";
import { useGroupsData } from "../hooks/useGroupsData";

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
  } = useGroupsData();

  return (
    <FeatureScreenLayout className="groups-page">
      <div className="groups-content-shell">

        {/* HEADER */}
        <FeaturePageHeader
          title="Grupos"
          actions={
            <SortingComponent
              selectedSorting={selectedSorting}
              onChangeHandler={handleGroupsOrder}
            />
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
                onParticipants={(id) => goToParticipants(id, navigate)}
                onDelete={(index) => deleteGroupItem(index)}
              />
            )}
          </FeatureListSection>
        )}

      </div>
    </FeatureScreenLayout>
  );
}

export default GroupsPage;