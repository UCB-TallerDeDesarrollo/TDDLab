import { CommitDataObject, CommitInformationDataObject } from "../../../../domain/models/githubCommitInterfaces";
import { JobDataObject } from '../../../../domain/models/jobInterfaces';
import { Bar, Line, getElementAtEvent} from 'react-chartjs-2';
import { useRef } from "react";

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
    LineController,
    LineElement
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    LineController,
    LineElement
);


function Charts(commits: CommitInformationDataObject[] | null,  jobsByCommit: Record<string, JobDataObject> | null) {
    
    function getDataLabels(){
        if (commits!=null){
            const commitsArray = commits.map((commit) => commits.indexOf(commit));
            return commitsArray;
        }else{
            return [];
        }
    }

    const getBarStyle = (commit:CommitDataObject) => {
        if (jobsByCommit != null && jobsByCommit[commit.sha] != null) {
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
            return conclusions.reverse();
        }else{
            return ["white"];
        }
    }

    function getCommitStats() {
        if (commits!=null){
            const additions = commits.map((commit) => commit.stats.additions).reverse();
            const deletions = commits.map((commit) => commit.stats.deletions).reverse();
            const total = commits.map((commit) => commit.stats.total).reverse();
            return [additions, deletions, total];
        }else{
            return [[],[],[]];
        }  
    }

    function getCommitLink() {
        if (commits!=null){
            const urls = commits.map((commit) => commit.html_url);
            return urls.reverse();
        }else{
            return [];
        }
    }

    const dataBarChart = {
        labels: getDataLabels(),
        datasets: [{
                        label: 'Lineas de Código Añadidas',
                        backgroundColor: "green",
                        data: getCommitStats()[0],
                        links:getCommitLink(),
                        fill:false
                    },
                    {
                        label: 'Lineas de Código Eliminadas',
                        backgroundColor: "red",
                        data: getCommitStats()[1],
                        links:getCommitLink(),
                        fill:false
                    }
                ]
    };

    const dataLineChart = {
        labels: getDataLabels(),
        datasets: [{
                        label: 'Lineas de Código Modificadas',
                        backgroundColor: getColorConclusion(),
                        data: getCommitStats()[2],
                        links:getCommitLink()
                }]
    };


    const optionsBarChartVertical = {
        responsive : true,
        barThickness: 20,
        scales:{
            x:{
                stacked:true,
                title: {
                    display:true,
                    text:"Commits realizados",
                    font: {
                        size: 30,
                        weight: 'bold',
                        lineHeight: 1.2,
                    },
                }
            },
            y:{
                stacked:true,
                title: {
                    display:true,
                    text:"Líneas de Código Modificadas",
                    font: {
                        size: 30,
                        weight: 'bold',
                        lineHeight: 1.2,
                    },
                }
            }
        },
    };

    const optionsBarChartHorizontal = {
        indexAxis: 'y' as const,
        responsive : true,
        barThickness: 15,
        scales:{
            x:{
                stacked:true,
                title: {
                    display:true,
                    text:"Líneas de Código Modificadas",
                    font: {
                        size: 30,
                        weight: 'bold',
                        lineHeight: 1.2,
                    },
                }
            },
            y:{
                stacked:true,
                title: {
                    display:true,
                    text:"Commits realizados",
                    font: {
                        size: 30,
                        weight: 'bold',
                        lineHeight: 1.2,
                    },
                }
            }
        },
    };

    const optionsLineChart = {
        responsive : true,
        pointRadius: 12,
        pointHoverRadius: 15,        
        scales:{
            x:{
                title: {
                    display:true,
                    text:"Commits realizados",
                    font: {
                        size: 30,
                        weight: 'bold',
                        lineHeight: 1.2,
                    },
                }
            },
            y:{
                title: {
                    display:true,
                    text:"Líneas de Código Modificadas",
                    font: {
                        size: 30,
                        weight: 'bold',
                        lineHeight: 1.2,
                    },
                }
            }
            
        },
    };

    
    const chartRef = useRef<any>();
    const onClick = (event:any) =>{
        if (getElementAtEvent(chartRef.current,event).length > 0){
            const dataSetIndexNum = getElementAtEvent(chartRef.current,event)[0].datasetIndex;
            const dataPoint = getElementAtEvent(chartRef.current,event)[0].index;
            console.log(dataLineChart.datasets[dataSetIndexNum].links[dataPoint])
            window.open(dataLineChart.datasets[dataSetIndexNum].links[dataPoint],'_blank')
        }
    }


    return (
        <>
            <h1>Gráfico de Barras Vertical</h1>
            <Bar height="100" data={dataBarChart} options={optionsBarChartVertical} onClick={onClick} ref={chartRef}/>
            <h1>Gráfico de Barras Horizontak</h1>
            <Bar height="200" data={dataBarChart} options={optionsBarChartHorizontal} onClick={onClick} ref={chartRef}/>
            <h1>Gráfico de Lineas y puntos</h1>
            <Line height="100" data={dataLineChart} options={optionsLineChart} onClick={onClick} ref={chartRef}/>
        </>
      );
}

export default Charts;