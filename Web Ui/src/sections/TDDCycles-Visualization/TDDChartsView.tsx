import { useEffect, useState } from "react";
import { JobDataObject } from "../../TDDCycles-Visualization/domain/jobInterfaces";
import { CommitDataObject, CommitInformationDataObject } from "../../TDDCycles-Visualization/domain/githubCommitInterfaces";
import TDDCharts from "./TDDChart";

interface CycleReportViewProps {
    commitsInfo: CommitInformationDataObject[] | null;
    jobsByCommit: Record<string, JobDataObject> | null;
  }
  

function TDDChartsView({ commitsInfo,jobsByCommit }: CycleReportViewProps) {

    console.log("Commits Info:", commitsInfo);
    return TDDCharts(commitsInfo,jobsByCommit);
}

export default TDDChartsView;