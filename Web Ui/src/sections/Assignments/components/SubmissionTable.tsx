import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Link as LinkIcon,
  RemoveCircle as RemoveCircleIcon,
} from "@mui/icons-material";
import { formatDate } from "../../../utils/dateUtils";
import type { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";

interface SubmissionTableProps {
  submissions: SubmissionDataObject[];
  studentEmails: Record<number, string>;
  disableAdditionalGraphs: boolean;
  showAdditionalGraphs?: boolean;
  onViewGraph: (submission: SubmissionDataObject) => void;
  onOpenAssistant: (submission: SubmissionDataObject) => void;
  onViewAdditionalGraph?: (submission: SubmissionDataObject) => void;
}

export const SubmissionTable = ({
  submissions,
  studentEmails,
  disableAdditionalGraphs,
  showAdditionalGraphs = false,
  onViewGraph,
  onOpenAssistant,
  onViewAdditionalGraph,
}: SubmissionTableProps) => {
  const shouldShowAdditionalGraphs = showAdditionalGraphs && !!onViewAdditionalGraph;

  return (
    <Table sx={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
      <TableHead>
        <TableRow sx={{ borderBottom: "1px solid #C9C9C9" }}>
          <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "18%" }}>Correo</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "11%", borderLeft: "1px solid #C9C9C9" }}>Estado</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "10%", borderLeft: "1px solid #C9C9C9" }}>Enlace</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "13%", borderLeft: "1px solid #C9C9C9" }}>Fecha de Inicio</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "14%", borderLeft: "1px solid #C9C9C9" }}>Fecha de Finalización</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "13%", borderLeft: "1px solid #C9C9C9" }}>Grafica</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "12%", borderLeft: "1px solid #C9C9C9" }}>Asistente AI</TableCell>
          {shouldShowAdditionalGraphs && (
            <TableCell sx={{ fontWeight: 700, fontSize: "1.65rem", py: 1.3, width: "12%", borderLeft: "1px solid #C9C9C9" }}>Graficas Adicionales</TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {submissions.map((submission) => {
          const studentEmail = studentEmails[submission.userid] ?? "";
          const formattedStartDate = formatDate(submission.start_date.toString());
          const formattedEndDate = submission.end_date
            ? formatDate(submission.end_date.toString())
            : "N/A";
          const hasRepositoryLink = submission.repository_link !== "";
          const teacherStatus = hasRepositoryLink ? "Enviado" : "No enviado";
          const statusColor = hasRepositoryLink ? "#4CAF50" : "#F44336";

          return (
            <TableRow key={submission.id} sx={{ borderBottom: "1px solid #C9C9C9" }}>
              <TableCell
                sx={{
                  py: 2.2,
                  fontSize: "1.3rem",
                  maxWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={studentEmail}
              >
                {studentEmail}
              </TableCell>
              <TableCell
                sx={{
                  py: 2.2,
                  fontSize: "1.3rem",
                  color: statusColor,
                  borderLeft: "1px solid #C9C9C9",
                  whiteSpace: "nowrap",
                }}
              >
                {teacherStatus}
              </TableCell>
              <TableCell sx={{ py: 2.2, borderLeft: "1px solid #C9C9C9", textAlign: "center" }}>
                {hasRepositoryLink ? (
                  <a
                    href={submission.repository_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", color: "#5C6BC0" }}
                  >
                    <LinkIcon />
                  </a>
                ) : (
                  <RemoveCircleIcon sx={{ color: "#F44336" }} />
                )}
              </TableCell>
              <TableCell sx={{ py: 2.2, fontSize: "1.3rem", borderLeft: "1px solid #C9C9C9" }}>{formattedStartDate}</TableCell>
              <TableCell sx={{ py: 2.2, fontSize: "1.3rem", borderLeft: "1px solid #C9C9C9" }}>{formattedEndDate}</TableCell>
              <TableCell sx={{ py: 2.2, borderLeft: "1px solid #C9C9C9" }}>
                <Button
                  variant="contained"
                  disabled={!hasRepositoryLink}
                  onClick={() => onViewGraph(submission)}
                  color="primary"
                  style={{
                    textTransform: "none",
                    fontSize: "1.15rem",
                    marginRight: "8px",
                    backgroundColor: !hasRepositoryLink ? "#BDBDBD" : undefined,
                    minWidth: "110px",
                  }}
                >
                  Ver grafica
                </Button>
              </TableCell>

              <TableCell sx={{ py: 2.2, borderLeft: "1px solid #C9C9C9" }}>
                <Button
                  variant="contained"
                  disabled={!hasRepositoryLink}
                  onClick={() => onOpenAssistant(submission)}
                  color="primary"
                  style={{
                    textTransform: "none",
                    fontSize: "1.15rem",
                    marginRight: "8px",
                    backgroundColor: !hasRepositoryLink ? "#BDBDBD" : undefined,
                    minWidth: "110px",
                  }}
                >
                  Asistente
                </Button>
              </TableCell>
              {shouldShowAdditionalGraphs && (
                <TableCell sx={{ py: 2.2, borderLeft: "1px solid #C9C9C9" }}>
                  <Button
                    variant="contained"
                    disabled={!hasRepositoryLink || disableAdditionalGraphs}
                    onClick={() => onViewAdditionalGraph?.(submission)}
                    color="primary"
                    style={{
                      textTransform: "none",
                      fontSize: "1.15rem",
                      marginRight: "7px",
                      backgroundColor:
                        !hasRepositoryLink || disableAdditionalGraphs ? "#BDBDBD" : undefined,
                      minWidth: "84px",
                    }}
                  >
                    Ver
                  </Button>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
