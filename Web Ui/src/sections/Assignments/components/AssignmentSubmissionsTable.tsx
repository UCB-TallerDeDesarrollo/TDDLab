import {
  CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
  Box, Card, CardContent, Typography, Button,
  useTheme, useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/system";
import { isStudent } from "../utils/assignmentDetailHelpers";
import { SubmissionRowData } from "../hooks/useStudentSubmissionRows";

interface AssignmentSubmissionsTableProps {
  role: string;
  loadingSubmissions: boolean;
  studentRows: SubmissionRowData[];
}

const CardsContainer = styled(Box)({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  paddingTop: "8px",
});

const SubmissionCard = styled(Card)({
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
});

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="body2" sx={{ color: "#999", fontWeight: 600, fontSize: "0.85rem", mb: 0.25 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

function MobileCards({ rows, showAdditionalGraphsCol }: { rows: SubmissionRowData[]; showAdditionalGraphsCol: boolean }) {
  if (rows.length === 0) {
    return (
      <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
        No hay entregas registradas
      </Typography>
    );
  }

  return (
    <CardsContainer>
      {rows.map((row) => (
        <SubmissionCard key={row.id}>
          <CardContent>
            <FieldBlock label="Usuario">
              <Typography variant="body1" sx={{ fontWeight: 500, fontSize: "0.95rem", wordBreak: "break-word" }}>
                {row.studentEmail}
              </Typography>
            </FieldBlock>

            <FieldBlock label="Estado">
              <Typography variant="body1" sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
                {row.status}
              </Typography>
            </FieldBlock>

            <FieldBlock label="Enlace">
              <Typography
                component="a"
                href={row.repositoryLink}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: "0.9rem", wordBreak: "break-all", color: "primary.main" }}
              >
                {row.repositoryLink || "N/A"}
              </Typography>
            </FieldBlock>

            <FieldBlock label="Fecha de Inicio">
              <Typography variant="body1" sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
                {row.startDate}
              </Typography>
            </FieldBlock>

            <FieldBlock label="Fecha de Finalización">
              <Typography variant="body1" sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
                {row.endDate}
              </Typography>
            </FieldBlock>

            <FieldBlock label="Comentario">
              <Typography variant="body1" sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
                {row.comment}
              </Typography>
            </FieldBlock>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                disabled={row.disableButtons}
                onClick={row.onViewGraph}
                sx={{ textTransform: "none", minHeight: "44px", flex: 1 }}
              >
                Gráfica
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={row.disableButtons}
                onClick={row.onOpenAssistant}
                sx={{ textTransform: "none", minHeight: "44px", flex: 1 }}
              >
                Asistente IA
              </Button>
              {showAdditionalGraphsCol && row.showAdditionalGraphs && (
                <Button
                  variant="contained"
                  size="small"
                  disabled={row.disableButtons || row.disableAdditionalGraphs}
                  onClick={row.onAdditionalGraphs}
                  sx={{ textTransform: "none", minHeight: "44px", flex: 1 }}
                >
                  Gráf. Adicionales
                </Button>
              )}
            </Box>
          </CardContent>
        </SubmissionCard>
      ))}
    </CardsContainer>
  );
}

function DesktopTable({ rows, showAdditionalGraphsCol }: { rows: SubmissionRowData[]; showAdditionalGraphsCol: boolean }) {
  const cellSx = { fontWeight: "600", color: "#1a1a1a", backgroundColor: "#eef2ff", borderBottom: "none" };
  const actionStyle = { textTransform: "none" as const, fontSize: "13px", marginRight: "7px" };

  return (
    <Table sx={{ minWidth: 650, borderCollapse: "separate", borderSpacing: "0 8px" }}>
      <TableHead>
        <TableRow>
          <TableCell align="center" sx={{ ...cellSx, borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}>Usuario</TableCell>
          <TableCell align="center" sx={cellSx}>Estado</TableCell>
          <TableCell align="center" sx={cellSx}>Enlace</TableCell>
          <TableCell align="center" sx={cellSx}>Fecha de Inicio</TableCell>
          <TableCell align="center" sx={cellSx}>Fecha de Finalización</TableCell>
          <TableCell align="center" sx={cellSx}>Comentario</TableCell>
          <TableCell align="center" sx={cellSx}>Gráfica</TableCell>
          <TableCell align="center" sx={cellSx}>Asistente IA</TableCell>
          {showAdditionalGraphsCol && (
            <TableCell align="center" sx={{ ...cellSx, borderTopRightRadius: "12px", borderBottomRightRadius: "12px" }}>
              Gráficas Adicionales
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showAdditionalGraphsCol ? 9 : 8} align="center" sx={{ py: 3 }}>
              No hay entregas registradas
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row) => (
            <TableRow key={row.id} sx={{ backgroundColor: "#fff", "& td": { borderBottom: "1px solid #f0f0f0" } }}>
              <TableCell align="center">{row.studentEmail}</TableCell>
              <TableCell align="center">{row.status}</TableCell>
              <TableCell align="center">
                <a href={row.repositoryLink} target="_blank" rel="noopener noreferrer">
                  {row.repositoryLink}
                </a>
              </TableCell>
              <TableCell align="center">{row.startDate}</TableCell>
              <TableCell align="center">{row.endDate}</TableCell>
              <TableCell align="center">{row.comment}</TableCell>
              <TableCell align="center">
                <Button variant="contained" disabled={row.disableButtons} onClick={row.onViewGraph} color="primary" style={actionStyle}>
                  Ver
                </Button>
              </TableCell>
              <TableCell align="center">
                <Button variant="contained" disabled={row.disableButtons} onClick={row.onOpenAssistant} color="primary" style={actionStyle}>
                  Asistente
                </Button>
              </TableCell>
              {showAdditionalGraphsCol && (
                <TableCell align="center">
                  {row.showAdditionalGraphs && (
                    <Button
                      variant="contained"
                      disabled={row.disableButtons || row.disableAdditionalGraphs}
                      onClick={row.onAdditionalGraphs}
                      color="primary"
                      style={actionStyle}
                    >
                      Ver
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export function AssignmentSubmissionsTable({
  role,
  loadingSubmissions,
  studentRows,
}: Readonly<AssignmentSubmissionsTableProps>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (isStudent(role)) return null;

  const showAdditionalGraphsCol = !isStudent(role);

  if (loadingSubmissions) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "150px" }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", overflowX: isMobile ? "visible" : "auto" }}>
      {isMobile ? (
        <MobileCards rows={studentRows} showAdditionalGraphsCol={showAdditionalGraphsCol} />
      ) : (
        <DesktopTable rows={studentRows} showAdditionalGraphsCol={showAdditionalGraphsCol} />
      )}
    </Box>
  );
}
