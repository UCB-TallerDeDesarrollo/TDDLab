import { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from "@mui/material";
import { styled } from "@mui/system";
import GetGroups from "../../modules/Groups/application/GetGroups";
import { GroupDataObject } from "../../modules/Groups/domain/GroupInterface";
import GroupsRepository from "../../modules/Groups/repository/GroupsRepository";

const CenteredContainer = styled(Container)({
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
});

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: "20px",
});

const FilterContainer = styled('div')({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "20px",
  marginBottom: "20px",
});

function UserPage() {
  const [users, setUsers] = useState<UserDataObject[]>([]);
  const getUsers = new GetUsers(new UsersRepository());
  const [groups, setGroups] = useState<GroupDataObject[]>([]);
  const getGroups = new GetGroups(new GroupsRepository());
  const [selectedGroup, setSelectedGroup] = useState<number | string>("all");

  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      try {
        const [userData, groupData] = await Promise.all([
          getUsers.getUsers(),
          getGroups.getGroups()
        ]);

        setUsers(userData);
        setGroups(groupData);
      } catch (error) {
        console.error("Error fetching users or groups:", error);
      }
    };

    fetchUsersAndGroups();
  }, [getUsers, getGroups]);

  type GroupMap = { [key: number]: string }

  const groupMap: GroupMap = groups.reduce((acc: GroupMap, group) => {
    acc[group.id] = group.groupName;
    return acc;
  }, {});

  const handleGroupChange = (event: SelectChangeEvent<number | string>) => {
    setSelectedGroup(event.target.value as number);
  };

  const filteredUsers = selectedGroup === "all" ? users : users.filter(user => user.groupid === selectedGroup);

  return (
    <div>
      <CenteredContainer>

        <FilterContainer>
          <FormControl sx={{ minWidth: 200, marginBottom: 2 }}>
          <InputLabel id="group-filter-label">Grupo</InputLabel>
          <Select
          labelId="group-filter-label"
          value={selectedGroup}
          onChange={handleGroupChange}
          label="Grupo" 
          >
            <MenuItem value="all">Todos los grupos</MenuItem>
            {groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>{group.groupName}</MenuItem>
            ))}
          </Select>
        </FormControl>
        </FilterContainer>
        
        <section className="Usuarios">
          <StyledTable>
            <TableHead>
              <TableRow sx={{ borderBottom: "2px solid #E7E7E7" }}>
                <TableCell sx={{ fontWeight: 560, color: "#333", fontSize: "1rem", width: "35%", lineHeight: "2.5" }}>
                  Correo electrónico
                </TableCell>
                <TableCell sx={{ fontWeight: 560, color: "#333", fontSize: "1rem", width: "35%", lineHeight: "2" }}>
                  Curso
                </TableCell>
                <TableCell sx={{ fontWeight: 560, color: "#333", fontSize: "1rem", width: "20%", lineHeight: "2" }}>
                  Rol
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} sx={{ borderBottom: "2px solid #E7E7E7" }}>
                  <TableCell sx={{ lineHeight: "3" }}>{user.email}</TableCell>
                  <TableCell sx={{ lineHeight: "3" }}>{groupMap[user.groupid] || "Unknown Group"}</TableCell>
                  <TableCell sx={{ lineHeight: "3" }}>{user.role}</TableCell>
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
