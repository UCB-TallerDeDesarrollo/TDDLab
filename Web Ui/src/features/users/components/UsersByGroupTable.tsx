import { Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import { styled } from "@mui/system";
import { UserDataObject } from "../../../modules/Users/domain/UsersInterface";

interface UsersByGroupTableProps {
  users: UserDataObject[];
}

const StyledTable = styled(Table)({
  width: "82%",
  marginLeft: "auto",
  marginRight: "auto",
  borderCollapse: "collapse",
  border: "1px solid #E0E0E0",
});

function UsersByGroupTable({ users }: UsersByGroupTableProps) {
  return (
    <section className="UsersByGroup">
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
                textAlign: "center",
                fontFamily: "Roboto, Arial, sans-serif",
              }}
            >
              Email
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell sx={{ textAlign: "center", py: 3 }}>
                No hay usuarios en este grupo
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id} sx={{ borderBottom: "1px solid #E7E7E7" }}>
                <TableCell sx={{ textAlign: "center" }}>{user.email}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </StyledTable>
    </section>
  );
}

export default UsersByGroupTable;