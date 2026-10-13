interface StudentSubmissionSummaryProps {
  status: string;
  statusValue?: string;
  repositoryLink?: string;
  comment?: string;
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
}: Readonly<StudentSubmissionSummaryProps>) {
  const statusClass = getStatusClass(statusValue);
  return (
    <>
      <p className="assignment-student-row">
        <strong>Enlace:</strong>{" "}
        {repositoryLink ? (
          <a
            href={repositoryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="assignment-student-link"
          >
            {repositoryLink}
          </a>
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
