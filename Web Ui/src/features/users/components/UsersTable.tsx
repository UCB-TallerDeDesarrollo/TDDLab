import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/system";
import { UserDataObject } from "../../../modules/Users/domain/UsersInterface";

interface UsersTableProps {
  users: UserDataObject[];
  groupMap: Record<number, string>;
  onRemove: (userId: number) => void;
}

const TABLE_BORDER = "#898989";
const HEADER_BACKGROUND = "#D9D9D9";
const CELL_BORDER = "#D0D0D0";

const TableWrapper = styled(Box)({
  width: "100%",
  overflowX: "auto",
});

const StyledTable = styled(Table)({
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed",
  border: `0.5px solid ${TABLE_BORDER}`,
});

const sharedHeaderCellStyles = {
  fontWeight: 700,
  fontSize: "20px",
  lineHeight: "24px",
  color: "#000000",
  textAlign: "center",
  fontFamily: '"Inter", sans-serif',
  borderRight: `0.5px solid ${TABLE_BORDER}`,
  padding: "14px 18px",
};

const sharedBodyCellStyles = {
  fontSize: "16px",
  lineHeight: "20px",
  color: "#000000",
  fontFamily: '"Inter", sans-serif',
  borderRight: `0.5px solid ${TABLE_BORDER}`,
  borderBottom: `0.5px solid ${CELL_BORDER}`,
  padding: "18px 20px",
};

function UsersTable({ users, groupMap, onRemove }: UsersTableProps) {
  return (
    <TableWrapper component="section" className="Usuarios">
      <StyledTable>
        <TableHead>
          <TableRow sx={{ backgroundColor: HEADER_BACKGROUND }}>
            <TableCell
              sx={{
                ...sharedHeaderCellStyles,
                width: "26%",
              }}
            >
              Correo
            </TableCell>
            <TableCell
              sx={{
                ...sharedHeaderCellStyles,
                width: "42%",
              }}
            >
              Grupo
            </TableCell>
            <TableCell
              sx={{
                ...sharedHeaderCellStyles,
                width: "16%",
              }}
            >
              Rol
            </TableCell>
            <TableCell
              sx={{
                ...sharedHeaderCellStyles,
                width: "16%",
                borderRight: "none",
              }}
            >
              Eliminar
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                sx={{
                  ...sharedBodyCellStyles,
                  borderRight: "none",
                  textAlign: "center",
                  py: 4,
                }}
              >
                No se encontraron resultados
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell
                  sx={{
                    ...sharedBodyCellStyles,
                    textAlign: "left",
                  }}
                >
                  {user.email}
                </TableCell>
                <TableCell
                  sx={{
                    ...sharedBodyCellStyles,
                    textAlign: "left",
                  }}
                >
                  {groupMap[user.groupid] || "Unknown"}
                </TableCell>
                <TableCell
                  sx={{
                    ...sharedBodyCellStyles,
                    textAlign: "center",
                    textTransform: "capitalize",
                  }}
                >
                  {user.role}
                </TableCell>
                <TableCell
                  sx={{
                    ...sharedBodyCellStyles,
                    borderRight: "none",
                    textAlign: "center",
                  }}
                >
                  <Tooltip title={`Eliminar de ${groupMap[user.groupid]}`} arrow>
                    <RemoveCircleIcon
                      onClick={() => onRemove(user.id)}
                      sx={{ color: "#D81B1B", cursor: "pointer" }}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </StyledTable>
    </TableWrapper>
  );
}

export default UsersTable;
