import { useState } from "react";
import { useNavigate } from "react-router-dom";

import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";
import FeatureSectionDivider from "../../../shared/components/FeatureSectionDivider";
import FeatureListSection from "../../../shared/components/FeatureListSection";
import FeatureItemsLayout from "../../../shared/components/FeatureItemsLayout";
import ContentState from "../../../shared/components/ContentState";
import SortingComponent from "../../../shared/components/SortingComponent";

import { GroupItem } from "../components/GroupItem";
import { useGroupsData } from "../hooks/useGroupsData";

import { getCourseLink } from "../../../modules/Groups/application/GetCourseLink";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import GetUsersByGroupId from "../../../modules/Users/application/getUsersByGroupid";

import "./GroupsPage.css";

function GroupsPage() {
  const navigate = useNavigate();

  const {
    groups,
    selectedSorting,
    handleGroupsOrder,
  } = useGroupsData();

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const userRepository = new UsersRepository();
  const getUsersByGroupId = new GetUsersByGroupId(userRepository);

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

        {/* LISTA */}
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
            <div className="groups-list">
              <FeatureItemsLayout>
                {groups.map((group, index) => (
                  <GroupItem
                    key={group.id}
                    group={group}
                    onCopy={() => getCourseLink(group.id, "teacher")}
                    onLink={() => getCourseLink(group.id, "student")}
                    onParticipants={async () => {
                      await getUsersByGroupId.execute(group.id);
                      navigate(`/users/group/${group.id}`);
                    }}
                    onDelete={() => {
                      setSelectedIndex(index);
                      setConfirmationOpen(true);
                    }}
                  />
                ))}
              </FeatureItemsLayout>
            </div>
          )}
        </FeatureListSection>

      </div>
    </FeatureScreenLayout>
  );
}

export default GroupsPage;