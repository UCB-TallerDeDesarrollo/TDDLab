import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { UserDataObject } from "../../../modules/Users/domain/UsersInterface";

interface UsersTableProps {
  users: UserDataObject[];
  groupMap: Record<number, string>;
  onRemove: (userId: number) => void;
}

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
  marginTop: "20px",
  borderCollapse: "collapse",
  border: "1px solid #E0E0E0",
});

function UsersTable({ users, groupMap, onRemove }: UsersTableProps) {
  return (
    <section className="Usuarios">
      <StyledTable>
        <TableHead>
          <TableRow
            sx={{
              borderBottom: "1px solid #E0E0E0",
              backgroundColor: "#E5E5E5",
            }}
          >
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: "18px",
                color: "#222",
                borderRight: "1px solid #CFCFCF",
                textAlign: "center",
                fontFamily: "Roboto, Arial, sans-serif",
              }}
            >
              Correo
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: "18px",
                color: "#222",
                borderRight: "1px solid #CFCFCF",
                textAlign: "center",
                fontFamily: "Roboto, Arial, sans-serif",
              }}
            >
              Grupo
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: "18px",
                color: "#222",
                borderRight: "1px solid #CFCFCF",
                textAlign: "center",
                fontFamily: "Roboto, Arial, sans-serif",
              }}
            >
              Rol
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 600,
                fontSize: "18px",
                color: "#222",
                textAlign: "center",
                fontFamily: "Roboto, Arial, sans-serif",
              }}
            >
              Eliminar
            </TableCell>
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
              <TableRow key={user.id} sx={{ borderBottom: "2px solid #E7E7E7" }}>
                <TableCell
                  sx={{
                    borderRight: "1px solid #E0E0E0",
                    textAlign: "left",
                    paddingLeft: "10%",
                  }}
                >
                  {user.email}
                </TableCell>
                <TableCell
                  sx={{
                    borderRight: "1px solid #E0E0E0",
                    textAlign: "left",
                    paddingLeft: "7%",
                  }}
                >
                  {groupMap[user.groupid] || "Unknown"}
                </TableCell>
                <TableCell
                  sx={{
                    borderRight: "1px solid #E0E0E0",
                    textAlign: "center",
                  }}
                >
                  {user.role}
                </TableCell>
                <TableCell sx={{ borderRight: "none", textAlign: "center" }}>
                  <Tooltip title={`Eliminar de ${groupMap[user.groupid]}`} arrow>
                    <RemoveCircleIcon
                      onClick={() => onRemove(user.id)}
                      sx={{ color: "#d81b1b", cursor: "pointer" }}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </StyledTable>
    </section>
  );
}

export default UsersTable;