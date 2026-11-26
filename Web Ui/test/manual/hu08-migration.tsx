import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { CommitHistoryAdapter } from "../../src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter";
import TDDChartPage from "../../src/presentation/tdd-visualization/pages/TDDChartPage";

// QA entry only. The production page, use cases and fetch adapter are unchanged.
// User names, comments and remote branch discovery are outside migration QA.
class QAAdapter extends CommitHistoryAdapter {
  async obtainUserName() { return "HU08"; }
  async obtainBranches() { return []; }
}
const params = new URLSearchParams(window.location.search);
const repo = params.get("repo") ?? "migration-validation";
const role = params.get("role") ?? "student";
const port = new QAAdapter("http://127.0.0.1:3008/api");
localStorage.setItem("selectedMetric", "Lista");

createRoot(document.getElementById("root")!).render(
  <MemoryRouter initialEntries={[`/?repoOwner=hu08&repoName=${encodeURIComponent(repo)}&branch=main`]}>
    <header style={{ background: "#052845", color: "white", padding: "18px 32px", fontFamily: "Arial" }}>
      <strong>TDDLab</strong> · HU08 · Validación local con PostgreSQL
    </header>
    <TDDChartPage port={port} role={role} teacher_id={0} graphs="blocks" />
  </MemoryRouter>,
);
