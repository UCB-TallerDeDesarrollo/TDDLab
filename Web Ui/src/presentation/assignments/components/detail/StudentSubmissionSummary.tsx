interface StudentSubmissionSummaryProps {
  status: string;
  repositoryLink?: string;
  comment?: string;
}

function getStatusClass(status: string): string {
  switch (status) {
    case "En progreso":
      return "is-progress";
    case "Enviado":
      return "is-sent";
    default:
      return "is-pending";
  }
}

export function StudentSubmissionSummary({
  status,
  repositoryLink,
  comment,
}: Readonly<StudentSubmissionSummaryProps>) {
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
          className={`assignment-status-chip assignment-student-status ${getStatusClass(status)}`}
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
