import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import StatefulButton from "../../../../shared/components/StatefulButton";
import { SubmissionRowView, ViewState } from "../../types/assignmentDetail";

interface DeliveriesTableProps {
  state: ViewState;
  rows: SubmissionRowView[];
  showAdditionalGraphs: boolean;
  onOpenGraph: (row: SubmissionRowView) => void;
  onOpenAssistant: (row: SubmissionRowView) => void;
  onOpenAdditionalGraphs: (row: SubmissionRowView) => void;
}

function getStatusClass(status: string): string {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "enviado") {
    return "is-sent";
  }

  if (normalizedStatus === "en progreso") {
    return "is-progress";
  }

  return "is-pending";
}

export function DeliveriesTable({
  state: _state,
  rows,
  showAdditionalGraphs,
  onOpenGraph,
  onOpenAssistant,
  onOpenAdditionalGraphs,
}: Readonly<DeliveriesTableProps>) {
  return (
    <div className="assignment-table-wrapper">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: "22%" }}>Correo</TableCell>
            <TableCell sx={{ width: "12%" }}>Estado</TableCell>
            <TableCell sx={{ width: "8%" }}>Enlace</TableCell>
            <TableCell sx={{ width: "14%" }}>Fecha de inicio</TableCell>
            <TableCell sx={{ width: "14%" }}>Fecha de finalización</TableCell>
            <TableCell sx={{ width: "10%" }}>Gráfica</TableCell>
            <TableCell sx={{ width: "10%" }}>Asistente IA</TableCell>
            <TableCell sx={{ width: "10%" }}>Gráficas adicionales</TableCell>
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
                    className={`assignment-status-chip ${getStatusClass(row.status)}`}
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
                  <StatefulButton
                    variantStyle={hasRepository ? 'primary' : 'secondary'}
                    onClick={() => {
                      if (hasRepository) onOpenGraph(row);
                    }}
                  >
                    Ver gráfica
                  </StatefulButton>
                </TableCell>
                <TableCell>
                  <StatefulButton
                    variantStyle={hasRepository ? 'primary' : 'secondary'}
                    onClick={() => {
                      if (hasRepository) onOpenAssistant(row);
                    }}
                  >
                    Asistente
                  </StatefulButton>
                </TableCell>
                <TableCell>
                  <StatefulButton
                    variantStyle={hasRepository && showAdditionalGraphs ? 'primary' : 'secondary'}
                    onClick={() => {
                      if (hasRepository && showAdditionalGraphs) onOpenAdditionalGraphs(row);
                    }}
                  >
                    Ver
                  </StatefulButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
