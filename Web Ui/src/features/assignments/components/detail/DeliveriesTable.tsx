import {
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { SubmissionRowView, ViewState } from "../../types/assignmentDetail";

interface DeliveriesTableProps {
  state: ViewState;
  rows: SubmissionRowView[];
  showAdditionalGraphs: boolean;
  onOpenGraph: (row: SubmissionRowView) => void;
  onOpenAssistant: (row: SubmissionRowView) => void;
  onOpenAdditionalGraphs: (row: SubmissionRowView) => void;
}

export function DeliveriesTable({
  state,
  rows,
  showAdditionalGraphs,
  onOpenGraph,
  onOpenAssistant,
  onOpenAdditionalGraphs,
}: Readonly<DeliveriesTableProps>) {
  if (state === "loading") {
    return (
      <div className="assignment-deliveries-state">
        <CircularProgress size={32} thickness={4} />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="assignment-deliveries-state">
        <Typography color="error">
          No se pudieron cargar las entregas. Intenta de nuevo en unos minutos.
        </Typography>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="assignment-deliveries-state">
        <Typography>Aun no existen entregas para esta tarea.</Typography>
      </div>
    );
  }

  return (
    <div className="assignment-table-wrapper">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Correo</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Enlace</TableCell>
            <TableCell>Fecha de inicio</TableCell>
            <TableCell>Fecha de finalización</TableCell>
            <TableCell>Gráfica</TableCell>
            <TableCell>Asistente IA</TableCell>
            <TableCell>Gráficas adicionales</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const hasRepository = Boolean(row.repositoryLink);

            return (
              <TableRow key={row.id}>
                <TableCell>{row.email}</TableCell>
                <TableCell>
                  <span
                    className={`assignment-status-chip ${
                      row.status.toLowerCase() === "enviado"
                        ? "is-sent"
                        : row.status.toLowerCase() === "en progreso"
                          ? "is-progress"
                          : "is-pending"
                    }`}
                  >
                    {row.status}
                  </span>
                </TableCell>
                <TableCell>
                  {hasRepository ? (
                    <a
                      href={row.repositoryLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Abrir repositorio de ${row.email}`}
                      className="assignment-link-cell"
                    >
                      <LinkIcon />
                    </a>
                  ) : (
                    <span className="assignment-no-link">
                      <LinkIcon style={{ color: "#c0392b", fontSize: 20 }} />
                    </span>
                  )}
                </TableCell>
                <TableCell>{row.startDate}</TableCell>
                <TableCell>{row.endDate}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    className="assignment-action-btn"
                    disabled={!hasRepository}
                    onClick={() => onOpenGraph(row)}
                  >
                    Ver gráfica
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    className="assignment-action-btn"
                    disabled={!hasRepository}
                    onClick={() => onOpenAssistant(row)}
                  >
                    Asistente
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    className="assignment-action-btn"
                    disabled={!hasRepository || !showAdditionalGraphs}
                    onClick={() => onOpenAdditionalGraphs(row)}
                  >
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
