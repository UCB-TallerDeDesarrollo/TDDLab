import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Container, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/system";

import UsersByGroupTable from "../components/UsersByGroupTable";

import { GetGroupDetail } from "../../../modules/Groups/application/GetGroupDetail";
import GroupsRepository from "../../../modules/Groups/repository/GroupsRepository";
import { GroupDataObject } from "../../../modules/Groups/domain/GroupInterface";

import GetUsersByGroupId from "../../../modules/Users/application/getUsersByGroupid";
import UsersRepository from "../../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../../modules/Users/domain/UsersInterface";

// ------------------- STYLES -------------------
const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
});

// ---------------------------------------------

function UsersByGroupPage() {
  const { groupid } = useParams<{ groupid?: string }>();

  const [users, setUsers] = useState<UserDataObject[]>([]);
  const [group, setGroup] = useState<GroupDataObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  // -------- INSTANCIAS --------
  const userRepository = useMemo(() => new UsersRepository(), []);
  const groupsRepository = useMemo(() => new GroupsRepository(), []);

  const getUsersByGroupId = useMemo(
    () => new GetUsersByGroupId(userRepository),
    [userRepository]
  );

  const getGroupDetail = useMemo(
    () => new GetGroupDetail(groupsRepository),
    [groupsRepository]
  );

  // -------- FETCH --------
  useEffect(() => {
    if (!groupid) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [groupData, usersData] = await Promise.all([
          getGroupDetail.obtainGroupDetail(parseInt(groupid)),
          getUsersByGroupId.execute(parseInt(groupid)),
        ]);

        setGroup(groupData);
        setUsers(usersData);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupid, getGroupDetail, getUsersByGroupId]);

  // -------- STATES --------
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (error) return <div>Error al cargar datos</div>;

  // -------- RENDER --------
  return (
    <CenteredContainer>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        style={{
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        {group ? group.groupName : "Grupo"}
      </Typography>

      <UsersByGroupTable users={users} />
    </CenteredContainer>
  );
}

export default UsersByGroupPage;