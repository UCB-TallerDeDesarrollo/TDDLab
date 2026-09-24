interface StudentSubmissionSummaryProps {
  status: string;
  statusValue?: string;
  repositoryLink?: string;
  comment?: string;
}

export function StudentSubmissionSummary({
  status,
  statusValue,
  repositoryLink,
  comment,
}: Readonly<StudentSubmissionSummaryProps>) {
  const statusClass = statusValue === "delivered" ? "is-finished"
    : statusValue === "in progress" ? "is-progress" : "is-pending";
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
        <span
          role="status"
          aria-label="Estado de la tarea"
          className={`assignment-student-status ${statusClass}`}
        >
          {status}
        </span>
      </p>

      {comment && (
        <p className="assignment-student-row">
          <strong>Comentario:</strong> {comment}
        </p>
      )}
    </>
  );
}
