import {
  Button,
} from "@mui/material";
import {
  Link as LinkIcon,
  RemoveCircle as RemoveCircleIcon,
} from "@mui/icons-material";
import { useMemo } from "react";
import { formatDate } from "../../../utils/dateUtils";
import type { SubmissionDataObject } from "../../../modules/Submissions/Domain/submissionInterfaces";
import { submissionTableStyles } from "./SubmissionTable.styles";
import { TableView, type TableViewColumn } from "../../Shared/Components/TableView";

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

  const columns = useMemo<TableViewColumn<SubmissionDataObject>[]>(() => {
    const baseColumns: TableViewColumn<SubmissionDataObject>[] = [
      {
        id: "correo",
        header: "Correo",
        headerSx: submissionTableStyles.headerCorreoCell,
        cellSx: submissionTableStyles.emailCell,
        renderCell: (submission) => {
          const studentEmail = studentEmails[submission.userid] ?? "";
          return studentEmail;
        },
      },
      {
        id: "estado",
        header: "Estado",
        headerSx: submissionTableStyles.headerEstadoCell,
        getCellSx: (submission) => {
          const hasRepositoryLink = submission.repository_link !== "";
          const statusColor = hasRepositoryLink ? "#4CAF50" : "#F44336";
          return submissionTableStyles.statusCell(statusColor);
        },
        renderCell: (submission) => {
          const hasRepositoryLink = submission.repository_link !== "";
          return hasRepositoryLink ? "Enviado" : "No enviado";
        },
      },
      {
        id: "enlace",
        header: "Enlace",
        align: "center",
        headerSx: submissionTableStyles.headerEnlaceCell,
        cellSx: submissionTableStyles.linkCell,
        renderCell: (submission) => {
          const hasRepositoryLink = submission.repository_link !== "";
          return hasRepositoryLink ? (
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
          );
        },
      },
      {
        id: "fechaInicio",
        header: "Fecha de Inicio",
        headerSx: submissionTableStyles.headerFechaInicioCell,
        cellSx: submissionTableStyles.dateCell,
        renderCell: (submission) => formatDate(submission.start_date.toString()),
      },
      {
        id: "fechaFin",
        header: "Fecha de Finalización",
        headerSx: submissionTableStyles.headerFechaFinCell,
        cellSx: submissionTableStyles.dateCell,
        renderCell: (submission) =>
          submission.end_date ? formatDate(submission.end_date.toString()) : "N/A",
      },
      {
        id: "grafica",
        header: "Grafica",
        headerSx: submissionTableStyles.headerGraficaCell,
        cellSx: submissionTableStyles.actionCell,
        renderCell: (submission) => {
          const hasRepositoryLink = submission.repository_link !== "";
          return (
            <Button
              variant="contained"
              disabled={!hasRepositoryLink}
              onClick={() => onViewGraph(submission)}
              color="primary"
              style={submissionTableStyles.actionButton(!hasRepositoryLink)}
            >
              Ver grafica
            </Button>
          );
        },
      },
      {
        id: "asistente",
        header: "Asistente AI",
        headerSx: submissionTableStyles.headerAsistenteCell,
        cellSx: submissionTableStyles.actionCell,
        renderCell: (submission) => {
          const hasRepositoryLink = submission.repository_link !== "";
          return (
            <Button
              variant="contained"
              disabled={!hasRepositoryLink}
              onClick={() => onOpenAssistant(submission)}
              color="primary"
              style={submissionTableStyles.actionButton(!hasRepositoryLink)}
            >
              Asistente
            </Button>
          );
        },
      },
    ];

    if (!shouldShowAdditionalGraphs) {
      return baseColumns;
    }

    return [
      ...baseColumns,
      {
        id: "graficasAdicionales",
        header: "Graficas Adicionales",
        headerSx: submissionTableStyles.headerAdicionalesCell,
        cellSx: submissionTableStyles.actionCell,
        renderCell: (submission) => {
          const hasRepositoryLink = submission.repository_link !== "";
          const isDisabled = !hasRepositoryLink || disableAdditionalGraphs;
          return (
            <Button
              variant="contained"
              disabled={isDisabled}
              onClick={() => onViewAdditionalGraph?.(submission)}
              color="primary"
              style={submissionTableStyles.additionalActionButton(isDisabled)}
            >
              Ver
            </Button>
          );
        },
      },
    ];
  }, [
    studentEmails,
    onViewGraph,
    onOpenAssistant,
    shouldShowAdditionalGraphs,
    disableAdditionalGraphs,
    onViewAdditionalGraph,
  ]);

  return (
    <TableView
      rows={submissions}
      columns={columns}
      getRowKey={(submission) => submission.id}
      tableSx={submissionTableStyles.table}
      headRowSx={submissionTableStyles.headerRow}
      bodyRowSx={submissionTableStyles.row}
    />
  );
};
