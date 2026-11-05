import { useId, useState, type ReactNode } from 'react';
import { Card, CardContent, IconButton, Typography } from '@mui/material';
import MoreHoriz from '@mui/icons-material/MoreHoriz';
import '../styles/TDDCycleCard.css';

const boliviaTime = new Intl.DateTimeFormat('es-BO', {
  timeZone: 'America/La_Paz',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

export function TDDCommitDate({ date }: Readonly<{ date?: Date | number | string }>) {
  const value = date instanceof Date || date === undefined ? date : new Date(date);
  const valid = value && Number.isFinite(value.getTime());

  return (
    <Card className="dateCard">
      <CardContent>
        <Typography variant="body2" color="textSecondary">
          {valid ? (
            <time dateTime={value.toISOString()}>{boliviaTime.format(value)}</time>
          ) : 'Fecha no disponible'}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function TDDCommitLink({ href }: Readonly<{ href: string }>) {
  return (
    <a className="commit-card-link" href={href} target="_blank" rel="noopener noreferrer">
      Ver commit
    </a>
  );
}

export function TDDCommitHeading({ message, sha, commitNumber, children }: Readonly<{ message: string; sha: string; commitNumber?: number; children?: ReactNode }>) {
  const [title, ...lines] = message.trim().split(/\r?\n/);
  const body = lines.join('\n').trim();
  const [expanded, setExpanded] = useState(false);
  const messageId = useId();
  const messageLabel = expanded ? 'Ocultar mensaje del commit' : 'Mostrar mensaje del commit';

  return (
    <>
      <div className="commit-heading-top">
        {commitNumber !== undefined && <small className="commit-number">#{commitNumber}</small>}
        <strong className="commit-subject">{title || 'Sin título'}</strong>
        {body && (
          <IconButton
            size="small"
            type="button"
            title={messageLabel}
            aria-label={messageLabel}
            aria-expanded={expanded}
            aria-controls={messageId}
            onClick={() => setExpanded(!expanded)}
          >
            <MoreHoriz fontSize="small" />
          </IconButton>
        )}
      </div>
      <div className="commit-heading-details">
        <code title={sha}>{sha.slice(0, 7)}</code>
        {children}
      </div>
      {body && <p id={messageId} className="commit-message" hidden={!expanded}>{body}</p>}
    </>
  );
}
