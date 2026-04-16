import React from "react";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import "./GenericList.css";

// ── GenericListContainer ─────────────────────────────
interface GenericListContainerProps {
  children: React.ReactNode;
}

export const GenericListContainer: React.FC<GenericListContainerProps> = ({ children }) => {
  return (
    <div className="generic-list-container">
      {children}
    </div>
  );
};

// ── GenericListHeader ─────────────────────────────────
interface GenericListHeaderProps {
  title?: string;
  actions?: React.ReactNode;
}

export const GenericListHeader: React.FC<GenericListHeaderProps> = ({ title, actions }) => {
  return (
    <>
      <div className="generic-list-header">
        {title && <h2 className="generic-list-header-title">{title}</h2>}
        {actions && <div className="generic-list-header-actions">{actions}</div>}
      </div>
      <hr className="generic-list-divider" />
    </>
  );
};

// ── GenericListBody ───────────────────────────────────
interface GenericListBodyProps {
  children: React.ReactNode;
}

export const GenericListBody: React.FC<GenericListBodyProps> = ({ children }) => {
  return (
    <div className="generic-list-body">
      {children}
    </div>
  );
};

// ── GenericCard ───────────────────────────────────────
interface GenericCardProps {
  title: string | React.ReactNode;
  actions?: React.ReactNode;
  isSelected?: boolean;
  onSelectionChange?: () => void;
  showCheckbox?: boolean;
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  isHovered?: boolean;
  isExpanded?: boolean;
  details?: React.ReactNode;
}

export const GenericCard: React.FC<GenericCardProps> = ({
  title,
  actions,
  isSelected = false,
  onSelectionChange,
  showCheckbox = false,
  onClick,
  onHover,
  isExpanded = false,
  details,
}) => {
  const handleMouseEnter = () => onHover?.(true);
  const handleMouseLeave = () => onHover?.(false);

  const isClickable = !!onClick;

  return (
    <React.Fragment>
      <div
        className="generic-card-row"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showCheckbox && (
          <Checkbox
            checked={isSelected}
            onChange={onSelectionChange}
            size="small"
            className="generic-card-checkbox"
          />
        )}
        <div
          className={`generic-card ${isClickable ? "generic-card--clickable" : ""} ${
            isSelected ? "generic-card--selected" : ""
          }`}
          onClick={onClick}
          role={isClickable ? "button" : undefined}
          tabIndex={isClickable ? 0 : undefined}
          onKeyDown={isClickable ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.();
            }
          } : undefined}
        >
          <span className="generic-card-name">{title}</span>
          {actions && <div className="generic-card-actions">{actions}</div>}
        </div>
      </div>

      {details && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <div className="generic-card-detail">{details}</div>
        </Collapse>
      )}
    </React.Fragment>
  );
};
