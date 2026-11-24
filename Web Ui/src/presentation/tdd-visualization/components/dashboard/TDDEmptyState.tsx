interface TDDEmptyStateProps {
  title: string;
  description?: string;
  testId?: string;
}

export function TDDEmptyState({
  title,
  description,
  testId,
}: TDDEmptyStateProps) {
  return (
    <div className="tdd-dashboard__empty-state" data-testid={testId}>
      <strong role="status">{title}</strong>
      {description && <p>{description}</p>}
    </div>
  );
}
