import TDDCyclesList from "./sections/TDD-Visualization/TDDCyclesList";
import { GithubAPIAdapter } from "./TDD-Visualization/repositories/GithubAPIAdapter";
function App() {
  return (
    <div>
      <div></div>
      <h1>TDDLAB</h1>
      <div>cards Example</div>

      <TDDCyclesList port={new GithubAPIAdapter()}></TDDCyclesList>
    </div>
  );
}

export default App;
