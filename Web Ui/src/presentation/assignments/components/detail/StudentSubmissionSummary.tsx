import type { StudentAssignmentStatusVariant } from "../../services/assignmentActionState";

interface StudentSubmissionSummaryProps {
  status: string;
  statusVariant: StudentAssignmentStatusVariant;
  repositoryLink?: string;
  comment?: string;
}

export function StudentSubmissionSummary({
  status,
  statusVariant,
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
          role="status"
          aria-label={`Estado de la tarea: ${status}`}
          className={`assignment-status-chip assignment-student-status is-${statusVariant}`}
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
