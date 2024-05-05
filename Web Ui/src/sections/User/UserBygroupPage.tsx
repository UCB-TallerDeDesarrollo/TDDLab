import _React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // to fetch groupId from URL if applicable
import GetUsersByGroupId from "../../modules/Users/application/getUsersByGroupid";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import {
  Table, TableHead, TableBody, TableRow, TableCell, Container
} from "@mui/material";
import { styled } from "@mui/system";

const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
});

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
});

function UsersByGroupPage() {
  const [users, setUsers] = useState<UserDataObject[]>([]);
  const { groupid } = useParams<{ groupid?: string }>();

  useEffect(() => {
    if (groupid) {  // Check if groupId is not undefined
      const userRepository = new UsersRepository();
      const getUsersByGroupId = new GetUsersByGroupId(userRepository);

      const fetchUsers = async () => {
        try {
          const userData = await getUsersByGroupId.execute(parseInt(groupid));
          setUsers(userData);
        } catch (error) {
          console.error("Error fetching users:", error);
          // Optionally handle the error state here
        }
      };

      fetchUsers();
    } else {
      console.error("Group ID is undefined");
      // Handle the scenario where groupId is undefined (perhaps display a message or redirect)
    }
  }, [groupid]);  // Dependency on groupId ensures this effect runs when groupId changes


  return (
    <CenteredContainer>
      <section className="UsersByGroup">
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Groups ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.groupid}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </section>
    </CenteredContainer>
  );
}

export default UsersByGroupPage;
