import { Card, CardContent, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
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
    <Card variant="elevation" elevation={0}>
      <CardContent>
        <Typography
          variant="h6"
          component="div"
          align="center"
          style={{ ...typographyVariants.h4, lineHeight: "3.8" }}
        >
          Lista de Estudiantes
        </Typography>
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Enlace</TableCell>
                <TableCell>Fecha de inicio</TableCell>
                <TableCell>Fecha de finalización</TableCell>
                <TableCell>Comentario</TableCell>
                <TableCell>Gráfica</TableCell>
                <TableCell>Asistente</TableCell>
                <TableCell>Gráficas Adicionales</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentRows}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
