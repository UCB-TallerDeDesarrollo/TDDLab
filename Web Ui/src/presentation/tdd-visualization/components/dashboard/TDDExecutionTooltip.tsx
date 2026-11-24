import { useRef } from "react";
import { TDD_DASHBOARD_LAYOUT as LAYOUT } from "./dashboard.constants";

interface TDDExecutionTooltipProps {
  detail: string | null;
  x: number;
  y: number;
}

export function TDDExecutionTooltip({
  detail,
  x,
  y,
}: TDDExecutionTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  if (!detail) {
    return null;
  }

  const width = tooltipRef.current?.offsetWidth ?? 0;
  const height = tooltipRef.current?.offsetHeight ?? 0;
  const left = Math.max(
    8,
    Math.min(x + LAYOUT.tooltipOffset, window.innerWidth - width - 8),
  );
  const top = Math.max(
    8,
    Math.min(y + LAYOUT.tooltipOffset, window.innerHeight - height - 8),
  );

  return (
    <div
      ref={tooltipRef}
      className="tdd-dashboard__tooltip"
      role="tooltip"
      style={{ left, top, display: "block" }}
    >
      {detail}
    </div>
  );
}
