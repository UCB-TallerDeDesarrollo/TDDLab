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
import { submissionTableStyles } from "./SubmissionTable.styles";

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
    <Table sx={submissionTableStyles.table}>
      <TableHead>
        <TableRow sx={submissionTableStyles.headerRow}>
          <TableCell sx={submissionTableStyles.headerCorreoCell}>Correo</TableCell>
          <TableCell sx={submissionTableStyles.headerEstadoCell}>Estado</TableCell>
          <TableCell sx={submissionTableStyles.headerEnlaceCell}>Enlace</TableCell>
          <TableCell sx={submissionTableStyles.headerFechaInicioCell}>Fecha de Inicio</TableCell>
          <TableCell sx={submissionTableStyles.headerFechaFinCell}>Fecha de Finalización</TableCell>
          <TableCell sx={submissionTableStyles.headerGraficaCell}>Grafica</TableCell>
          <TableCell sx={submissionTableStyles.headerAsistenteCell}>Asistente AI</TableCell>
          {shouldShowAdditionalGraphs && (
            <TableCell sx={submissionTableStyles.headerAdicionalesCell}>Graficas Adicionales</TableCell>
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
            <TableRow key={submission.id} sx={submissionTableStyles.row}>
              <TableCell
                sx={submissionTableStyles.emailCell}
                title={studentEmail}
              >
                {studentEmail}
              </TableCell>
              <TableCell sx={submissionTableStyles.statusCell(statusColor)}>
                {teacherStatus}
              </TableCell>
              <TableCell sx={submissionTableStyles.linkCell}>
                {hasRepositoryLink ? (
                  <a
                    href={submission.repository_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={submissionTableStyles.linkIcon}
                  >
                    <LinkIcon />
                  </a>
                ) : (
                  <RemoveCircleIcon sx={{ color: "#F44336" }} />
                )}
              </TableCell>
              <TableCell sx={submissionTableStyles.dateCell}>{formattedStartDate}</TableCell>
              <TableCell sx={submissionTableStyles.dateCell}>{formattedEndDate}</TableCell>
              <TableCell sx={submissionTableStyles.actionCell}>
                <Button
                  variant="contained"
                  disabled={!hasRepositoryLink}
                  onClick={() => onViewGraph(submission)}
                  color="primary"
                  style={submissionTableStyles.actionButton(!hasRepositoryLink)}
                >
                  Ver grafica
                </Button>
              </TableCell>

              <TableCell sx={submissionTableStyles.actionCell}>
                <Button
                  variant="contained"
                  disabled={!hasRepositoryLink}
                  onClick={() => onOpenAssistant(submission)}
                  color="primary"
                  style={submissionTableStyles.actionButton(!hasRepositoryLink)}
                >
                  Asistente
                </Button>
              </TableCell>
              {shouldShowAdditionalGraphs && (
                <TableCell sx={submissionTableStyles.actionCell}>
                  <Button
                    variant="contained"
                    disabled={!hasRepositoryLink || disableAdditionalGraphs}
                    onClick={() => onViewAdditionalGraph?.(submission)}
                    color="primary"
                    style={submissionTableStyles.additionalActionButton(
                      !hasRepositoryLink || disableAdditionalGraphs
                    )}
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
