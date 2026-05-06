import { Card, CardContent, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from "@mui/material";
import { JSX } from "react";
import { isStudent } from "../utils/assignmentDetailHelpers";
import { typographyVariants } from "../../../styles/typography";

interface AssignmentSubmissionsTableProps {
  role: string;
  loadingSubmissions: boolean;
  studentRows: JSX.Element[];
}

export function AssignmentSubmissionsTable({
  role,
  loadingSubmissions,
  studentRows,
}: Readonly<AssignmentSubmissionsTableProps>) {
  if (isStudent(role)) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      {loadingSubmissions ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "150px",
          }}
        >
          <CircularProgress size={40} thickness={4} />
        </div>
      ) : (
        <Table sx={{ minWidth: 650, borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: '600', color: '#1a1a1a', backgroundColor: '#eef2ff', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', borderBottom: 'none' }}>Usuario</TableCell>
              <TableCell align="center" sx={{ fontWeight: '600', color: '#1a1a1a', backgroundColor: '#eef2ff', borderBottom: 'none' }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: '600', color: '#1a1a1a', backgroundColor: '#eef2ff', borderBottom: 'none' }}>Enlace</TableCell>
              <TableCell align="center" sx={{ fontWeight: '600', color: '#1a1a1a', backgroundColor: '#eef2ff', borderBottom: 'none' }}>Fecha de Inicio</TableCell>
              <TableCell align="center" sx={{ fontWeight: '600', color: '#1a1a1a', backgroundColor: '#eef2ff', borderBottom: 'none' }}>Fecha de Finalización</TableCell>
              <TableCell align="center" sx={{ fontWeight: '600', color: '#1a1a1a', backgroundColor: '#eef2ff', borderBottom: 'none' }}>Comentario</TableCell>
              <TableCell align="center" sx={{ fontWeight: '600', color: '#1a1a1a', backgroundColor: '#eef2ff', borderBottom: 'none' }}>Gráfica</TableCell>
              <TableCell align="center" sx={{ fontWeight: '600', color: '#1a1a1a', backgroundColor: '#eef2ff', borderBottom: 'none' }}>Asistente IA</TableCell>
              <TableCell align="center" sx={{ fontWeight: '600', color: '#1a1a1a', backgroundColor: '#eef2ff', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', borderBottom: 'none' }}>Gráficas Adicionales</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentRows}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
