import  { useState, useEffect } from "react";
import GetUsers from "../../modules/Users/application/getUsers";
import UsersRepository from "../../modules/Users/repository/UsersRepository";
import { UserDataObject } from "../../modules/Users/domain/UsersInterface";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Container,
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

function UserPage() {
  const [users, setUsers] = useState<UserDataObject[]>([]);
  const getUsers = new GetUsers(new UsersRepository());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers.getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [getUsers]);

  return (
    <div>
      <CenteredContainer>
        <section className="Usuarios">
          <StyledTable>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: 560, color: "#333", fontSize: "1rem", width: "35%" }}
                >
                  Correo electrónico
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 560, color: "#333", fontSize: "1rem", width: "65%" }}
                >
                  Curso
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.course}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </StyledTable>
        </section>
      </CenteredContainer>
    </div>
  );
}

export default UserPage;