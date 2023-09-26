import CycleReportView from "./sections/TDD-Visualization/CycleReportView";
import { GithubAPIAdapter } from "./TDD-Visualization/repositories/GithubAPIAdapter";
function App() {
  return (
    <div>
      <div></div>
      <h1>TDDLAB</h1>
      <div>cards Example</div>

      <CycleReportView port={new GithubAPIAdapter()}></CycleReportView>
    </div>
  );
}

export default App;
