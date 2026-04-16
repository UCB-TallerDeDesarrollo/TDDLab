import React from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
} from "@mui/material";

interface Props {
  groups: any[];
  renderRow: (group: any, index: number) => React.ReactNode;
}

export function GroupsList({ groups, renderRow }: Props) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid #E7E7E7",
        borderRadius: 2,
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: "#f9fafb" }}>
          <TableRow>
            <TableCell padding="checkbox" sx={{ width: "5%" }} />
            <TableCell sx={{ fontWeight: 600, width: "35%" }}>
              NOMBRE DEL GRUPO
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              ACCIONES
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {groups.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                No hay grupos disponibles
              </TableCell>
            </TableRow>
          )}

          {groups.map((group, index) => renderRow(group, index))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}