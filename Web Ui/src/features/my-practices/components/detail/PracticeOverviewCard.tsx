import { Typography } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface PracticeOverviewCardProps {
  title: string;
  createdAt: string;
}

export function PracticeOverviewCard({
  title,
  createdAt,
}: Readonly<PracticeOverviewCardProps>) {
  return (
    <section className="practice-task-card" aria-label="Resumen de practica">
      <div className="practice-task-title-block">
        <Typography component="h1" className="practice-task-title">
          {title}
        </Typography>
      </div>

      <div className="practice-task-meta-block">
        <div className="practice-task-meta-row">
          <CalendarMonthIcon fontSize="small" />
          <span className="practice-task-meta-label">Creacion:</span>
          <span>{createdAt}</span>
        </div>
      </div>
    </section>
  );
}
