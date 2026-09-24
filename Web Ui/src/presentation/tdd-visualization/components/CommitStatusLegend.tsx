import "../styles/CommitStatusLegend.css";

const legendItems = [
  {
    status: "success",
    label: "Pruebas pasadas",
    description: "Círculo verde.",
  },
  {
    status: "failed",
    label: "Pruebas fallidas",
    description: "Triángulo rojo.",
  },
  {
    status: "refactor",
    label: "Refactor",
    description: "Círculo verde con contorno azul.",
  },
] as const;

function CommitStatusLegend() {
  return (
    <aside className="commit-status-legend" aria-labelledby="commit-status-legend-title">
      <h2 id="commit-status-legend-title">Estados de los commits</h2>
      <ul>
        {legendItems.map((item) => (
          <li key={item.status}>
            <span className={`commit-status-marker commit-status-marker--${item.status}`} aria-hidden="true" />
            <span>
              <strong>{item.label}.</strong> {item.description}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default CommitStatusLegend;
