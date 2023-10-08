
import { JobDataObject } from "../../TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject } from "../../TDDCycles-Visualization/domain/githubCommitInterfaces";
import TDDCharts from "./TDDChart";

interface CycleReportViewProps {
    commitsInfo: CommitDataObject[] | null;
    jobsByCommit: JobDataObject[] | null;
  }
  

function TDDChartsView({ commitsInfo,jobsByCommit }: CycleReportViewProps) {

    console.log("Commits Info:", commitsInfo);
    return TDDCharts(commitsInfo,jobsByCommit);
}

export default TDDChartsView;