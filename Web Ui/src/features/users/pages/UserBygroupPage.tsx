import { CircularProgress } from "@mui/material";
import UsersByGroupTable from "../components/UsersByGroupTable";
import useUsersByGroupPage from "../hooks/useUsersByGroupPage";
import FeaturePageHeader from "../../../shared/components/FeaturePageHeader";
import FeatureScreenLayout from "../../../shared/components/FeatureScreenLayout";
import FeatureSectionDivider from "../../../shared/components/FeatureSectionDivider";

function UsersByGroupPage() {
  const { users, group, loading, error } = useUsersByGroupPage();

  if (loading) {
    return <CircularProgress />;
  }

  if (error) return <div>Error al cargar datos</div>;

  return (
    <FeatureScreenLayout className="UsersByGroup">
      <FeaturePageHeader title={group ? group.groupName : "Grupo"} />
      <FeatureSectionDivider />
      <UsersByGroupTable users={users} />
    </FeatureScreenLayout>
  );
}

export default UsersByGroupPage;
