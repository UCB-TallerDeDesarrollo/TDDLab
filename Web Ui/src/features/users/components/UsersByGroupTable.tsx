import { Box, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { styled } from "@mui/system";
import { UserDataObject } from "../../../modules/Users/domain/UsersInterface";

interface UsersByGroupTableProps {
  users: UserDataObject[];
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

function UsersByGroupTable({ users }: UsersByGroupTableProps) {
  return (
    <TableWrapper component="section" className="UsersByGroup">
      <StyledTable>
        <TableHead>
          <TableRow sx={{ backgroundColor: HEADER_BACKGROUND }}>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "20px",
                lineHeight: "24px",
                color: "#000000",
                textAlign: "center",
                fontFamily: '"Inter", sans-serif',
                padding: "14px 18px",
              }}
            >
              Correo
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                sx={{
                  fontSize: "16px",
                  lineHeight: "20px",
                  textAlign: "center",
                  fontFamily: '"Inter", sans-serif',
                  borderBottom: `0.5px solid ${CELL_BORDER}`,
                  py: 4,
                }}
              >
                No hay usuarios en este grupo
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell
                  sx={{
                    fontSize: "16px",
                    lineHeight: "20px",
                    color: "#000000",
                    textAlign: "left",
                    fontFamily: '"Inter", sans-serif',
                    borderBottom: `0.5px solid ${CELL_BORDER}`,
                    padding: "18px 20px",
                  }}
                >
                  {user.email}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </StyledTable>
    </TableWrapper>
  );
}

export default UsersByGroupTable;
