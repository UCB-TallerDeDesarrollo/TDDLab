import UsersByGroupTable from "../components/UsersByGroupTable";
import useUsersByGroupPage from "../hooks/useUsersByGroupPage";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";
import FeatureListSection from "../../../shared/components/FeatureListSection";
import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
import FeatureSectionDivider from "../../../shared/components/FeatureSectionDivider";
import ContentState from "../../../shared/components/ContentState";

function UsersByGroupPage() {
  const { users, group, loading, error } = useUsersByGroupPage();
  const headerTitle = group?.groupName ?? "Grupo";
  let usersContent = <ContentState variant="loading" title="Cargando..." />;

  if (error) {
    usersContent = (
      <ContentState
        variant="error"
        title="Error al cargar..."
        description="Hubo un problema al cargar los datos del grupo."
      />
    );
  } else if (loading === false && users.length === 0) {
    usersContent = (
      <ContentState
        variant="empty"
        title="Sin resultados"
        description="Este grupo todavía no tiene usuarios asignados."
      />
    );
  } else if (loading === false) {
    usersContent = <UsersByGroupTable users={users} />;
  }

  return (
    <FeatureScreenLayout className="users-by-group-page" sectionGap={0}>
      <FeaturePageHeader title={headerTitle} />
      <FeatureSectionDivider />
      <FeatureListSection>{usersContent}</FeatureListSection>
    </FeatureScreenLayout>
  );
}

export default UsersByGroupPage;
