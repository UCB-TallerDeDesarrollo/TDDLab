interface StudentSubmissionSummaryProps {
  status: string;
  repositoryLink?: string;
  comment?: string;
  statusClassName?: string;
}

export function StudentSubmissionSummary({
  status,
  repositoryLink,
  comment,
  statusClassName,
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
        <span className={statusClassName}>{status}</span>
      </p>

      {comment && (
        <p className="assignment-student-row">
          <strong>Comentario:</strong> {comment}
        </p>
      )}
    </>
  );
}
