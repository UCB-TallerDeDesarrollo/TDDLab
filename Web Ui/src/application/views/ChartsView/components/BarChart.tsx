import { CommitDataObject } from '../../../../domain/models/githubCommitInterfaces';
import { JobDataObject } from '../../../../domain/models/jobInterfaces';
import { Bar} from 'react-chartjs-2';

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


function BarsChart(commits: CommitDataObject[] | undefined,  jobs: Record<string, JobDataObject> | undefined) {
    function getDataLabels(){
        if (commits!=null){
            return commits.map((commit) => commit.commit.message);
        }else{
            return ["Empty"];
        }
    }

    const getBarStyle = (conclusion: string) => {
        if (conclusion === 'success') {
          return 'green';
        } else {
          return 'red';
        }
    };
    
    function getColorConclusion(){
        if (commits!=null && jobs != null){
            const conclusions = commits.map((commit) => getBarStyle(jobs[commit.sha].jobs[0].conclusion));
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
                data: [1,2,3,4,5,6,7,8,9,1,0,2,2,0,5,5,0,5,5,0],
                backgroundColor: getColorConclusion(),
                //links: linkCommits
            }
        ]
    };

    const options = {
        indexAxis: 'y' as const,
        responsive : true,
    };

    return <Bar data={data} options={options}/>
}

export default BarsChart;