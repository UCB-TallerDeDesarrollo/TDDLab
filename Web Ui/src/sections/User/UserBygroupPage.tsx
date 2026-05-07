import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { GetGroupDetail } from "../../modules/Groups/application/GetGroupDetail";
import GetUsersByGroupId from "../../modules/Users/application/getUsersByGroupid";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import {
  Typography,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { CenteredContainer, StyledTable } from "./userTableStyles";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";

function UsersByGroupPage() {
  const [users, setUsers] = useState<UserDataObject[]>([]);
  const { groupid } = useParams<{ groupid?: string }>();
  const[group, setGroup] =useState<GroupDataObject|null>(null);
  useEffect(() => {
    if (groupid) {  // Checks if groupId is not undefined
      const userRepository = new UsersRepository();
      const getUsersByGroupId = new GetUsersByGroupId(userRepository);
      const groupsRepository = new GroupsRepository();
      const getGroupDetail = new GetGroupDetail(groupsRepository);
      const fetchGroupAndUsers = async () => {
        try {
          const groupDetail = await getGroupDetail.obtainGroupDetail(parseInt(groupid))
          setGroup(groupDetail);
          const userData = await getUsersByGroupId.execute(parseInt(groupid));
          setUsers(userData);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };

      fetchGroupAndUsers();
    } else {
      console.error("Group ID is undefined");
    }
  }, [groupid]);


  return (
    <CenteredContainer>
      <Typography variant="h4" component="h1" gutterBottom style={{ textAlign: 'center', marginTop: '20px' }}>
        {group? group.groupName : 'Loading...'}
      </Typography>
      <section className="UsersByGroup">
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </section>
    </CenteredContainer>
  );
}

export default UsersByGroupPage;
