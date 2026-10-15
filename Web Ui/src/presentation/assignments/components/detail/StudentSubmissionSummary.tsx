import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";

interface StudentSubmissionSummaryProps {
  status: string;
  statusValue?: string;
  repositoryLink?: string;
  comment?: string;
  canEditRepository?: boolean;
  onEditRepository?: () => void;
}

function getStatusClass(status: string | undefined): string {
  if (status === "delivered") return "is-finished";
  if (status === "in progress") return "is-progress";
  return "is-pending";
}

export function StudentSubmissionSummary({
  status,
  statusValue,
  repositoryLink,
  comment,
  canEditRepository = false,
  onEditRepository,
}: Readonly<StudentSubmissionSummaryProps>) {
  const statusClass = getStatusClass(statusValue);
  return (
    <>
      <p className="assignment-student-row">
        <strong>Enlace:</strong>{" "}
        {repositoryLink ? (
          <span className="assignment-student-link-cell">
            <a
              href={repositoryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="assignment-student-link"
            >
              {repositoryLink}
            </a>
            {canEditRepository && onEditRepository && (
              <IconButton
                aria-label="Editar enlace del repositorio"
                size="small"
                onClick={onEditRepository}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </span>
        ) : (
          "Sin enlace"
        )}
      </p>

      <p className="assignment-student-row">
        <strong>Estado:</strong>{" "}
        <output
          aria-label="Estado de la tarea"
          className={`assignment-student-status ${statusClass}`}
        >
          {status}
        </output>
      </p>

      {comment && (
        <p className="assignment-student-row">
          <strong>Comentario:</strong> {comment}
        </p>
      )}
    </>
  );
}
