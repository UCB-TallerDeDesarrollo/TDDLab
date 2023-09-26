import { CommitDataObject } from '../../../../domain/models/githubCommitInterfaces';
import { JobDataObject } from '../../../../domain/models/jobInterfaces';
import { Bar, Line} from 'react-chartjs-2';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface CycleChartViewProps {
    commit: CommitDataObject;
    jobs: JobDataObject | null;
}

function BarsChart(commits: CommitDataObject[] | undefined,  jobsByCommit: Record<string, JobDataObject> | undefined) {
    function getDataLabels(){
        if (commits!=null){
            return commits.map((commit) => commit.commit.message);
        }else{
            return ["Empty"];
        }
    }

    const getBarStyle = (commit:CommitDataObject) => {
        if (jobsByCommit != undefined && jobsByCommit[commit.sha] != null) {
            if (jobsByCommit[commit.sha].jobs[0].conclusion === 'success') {
                return "green";
            } else {
                return "red";
            }
        } else {
          return 'black';
        }
    };
    
    function getColorConclusion(){
        if (commits!=null && jobsByCommit != null){

            const conclusions = commits.map((commit) => getBarStyle(commit));
            return conclusions
        }else{
            return "white";
        }
    }

    const data = {
        labels: getDataLabels(),
        datasets: [
            {
                label: 'Beneficios',
                data: [10,50,60,40,68,98,70,75,80,81,81,82,41,78,89,78,80,75,60,90,87,41,45,59,58,56,78,41,78,41,50,60,70,80,89,84,85,81,86,87,65,94,36,47,85,78,10,15,89,98,45,78,22,74,52],
                backgroundColor: getColorConclusion(),
                
                //links: linkCommits
            }
        ]
    };

    const optionsBarChart = {
        indexAxis: 'y' as const,
        responsive : true,
        barThickness: 20,
    };

    const optionsLineChart = {
        responsive : true,
        pointRadius: 10,
        pointHoverRadius: 10
    };

    return (
        <>
          <Bar height="300" data={data} options={optionsBarChart}/>
          <Line data={data} options={optionsLineChart}/>
        </>
      );
}

export default BarsChart;