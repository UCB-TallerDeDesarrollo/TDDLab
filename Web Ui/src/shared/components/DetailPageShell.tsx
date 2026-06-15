import { ReactNode } from "react";
import "../styles/DetailPage.css";

interface DetailPageShellProps {
  children: ReactNode;
}

function DetailPageShell({ children }: Readonly<DetailPageShellProps>) {
  return (
    <div className="detail-page">
      <div className="detail-content-shell">{children}</div>
    </div>
  );
}

export default DetailPageShell;
