import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

import { UserDataObject } from "../../modules/Users/domain/UsersInterface";

interface UsersTableProps {
  users: UserDataObject[];
  groupMap: { [key: number]: string };
  onRemoveUser: (userId: number) => void;
}

const StyledTable = styled(Table)({
  width: "100%",
  borderCollapse: "collapse",
});

const headerCellSx = {
  fontWeight: 600,
  borderBottom: "1px solid #d9d9d9",
  borderRight: "1px solid #d9d9d9",
  padding: "10px 8px",
};

const lastHeaderCellSx = {
  fontWeight: 600,
  borderBottom: "1px solid #d9d9d9",
  padding: "10px 8px",
};

const bodyCellSx = {
  borderBottom: "1px solid #d9d9d9",
  borderRight: "1px solid #d9d9d9",
  padding: "10px 8px",
};

const lastBodyCellSx = {
  borderBottom: "1px solid #d9d9d9",
  padding: "10px 8px",
};

function UsersTable({ users, groupMap, onRemoveUser }: UsersTableProps) {
  return (
    <StyledTable>
      <TableHead>
        <TableRow>
          <TableCell sx={headerCellSx}>Correo</TableCell>
          <TableCell sx={headerCellSx}>Grupo</TableCell>
          <TableCell sx={headerCellSx}>Rol</TableCell>
          <TableCell sx={lastHeaderCellSx}>Eliminar</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} sx={{ textAlign: "center", py: 3 }}>
              No se encontraron resultados
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell sx={bodyCellSx}>{user.email}</TableCell>
              <TableCell sx={bodyCellSx}>
                {groupMap[user.groupid] || "Unknown"}
              </TableCell>
              <TableCell sx={bodyCellSx}>{user.role}</TableCell>
              <TableCell sx={lastBodyCellSx}>
                <Tooltip title="Eliminar" arrow>
                  <RemoveCircleIcon
                    onClick={() => onRemoveUser(user.id)}
                    sx={{ color: "#ff1a1a", cursor: "pointer" }}
                  />
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </StyledTable>
  );
}

export default UsersTable;