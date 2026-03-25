import { Typography } from "@mui/material";

interface StudentSubmissionSummaryProps {
  status: string;
  repositoryLink?: string;
  comment?: string;
}

export function StudentSubmissionSummary({
  status,
  repositoryLink,
  comment,
}: Readonly<StudentSubmissionSummaryProps>) {
  return (
    <section className="assignment-student-summary" aria-label="Mi entrega">
      <Typography component="h2" className="assignment-section-title">
        Mi entrega
      </Typography>

      <p className="assignment-student-row">
        <strong>Estado:</strong> {status}
      </p>

      <p className="assignment-student-row">
        <strong>Enlace:</strong>{" "}
        {repositoryLink ? (
          <a href={repositoryLink} target="_blank" rel="noopener noreferrer">
            {repositoryLink}
          </a>
        ) : (
          "Sin enlace"
        )}
      </p>

      {comment && (
        <p className="assignment-student-row">
          <strong>Comentario:</strong> {comment}
        </p>
      )}
    </section>
  );
}
