import React from "react";
import { Bubble, Line } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

interface CycleReportViewProps {
  commits: CommitDataObject[];
  jobsByCommit: JobDataObject[];
}

const TDDBoard: React.FC<CycleReportViewProps> = ({ commits, jobsByCommit }) => {
  const testCounts = commits.map(commit => commit.test_count);
  const minTestCount = Math.min(...testCounts);
  const maxTestCount = Math.max(...testCounts);
  const numberOfLabels = 5;
  const step = Math.ceil(maxTestCount / (numberOfLabels ));
  const labels = Array.from({ length: numberOfLabels }, (_, i) => maxTestCount - i * step);

  const getColorByTestCountAndConclusion = (testCount: number, conclusion: string) => {
    const intensity = (testCount - minTestCount) / (maxTestCount - minTestCount);
    const adjustedIntensity = Math.max(0, Math.min(intensity, 1)); 

    if (conclusion === "success") {
        const greenValue = Math.floor(200 + (55 * adjustedIntensity)); 
        const alpha = adjustedIntensity < 0.3 ? 0.3 : 0.6; 
        return `rgba(0, ${greenValue}, 0, ${alpha})`; 
    } else {
        return `rgba(255, 0, 0, 0.7)`; 
    }
  };

  const mainData = {
    datasets: commits.map((commit, index) => {
        const job = jobsByCommit.find(job => job.sha === commit.sha);
        const backgroundColor = getColorByTestCountAndConclusion(commit.test_count, job?.conclusion || "failed");

        return {
            label: `Commit ${index + 1}`,
            data: [{
                x: index + 1,
                y: commit.coverage,
                r: Math.max(10, commit.stats.total / 5),
            }],
            backgroundColor,
            borderColor: `rgba(0,0,0,0.2)`,
            hoverBackgroundColor: "rgba(0,0,0,0.3)",
            hoverBorderColor: "rgba(0,0,0,0.1)"
        };
    })
  };

  const mainOptions: any = {
    scales: {
      x: { 
        title: { display: true, text: "Commits" },
        ticks: { 
          callback: (value: any) => `Commit ${value}` 
        }
      },
      y: { 
        title: { display: true, text: "Cobertura de Pruebas (%)" }, 
        min: 70, 
        max: 110, 
        suggestedMax: 120 
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const index = tooltipItem.raw.x - 1; 
            const commit = commits[index];
            const commitNumber = index + 1;
  
            return [
              `Commit ${commitNumber}: ${commit.commit.message}`, 
              `Líneas Modificadas: ${commit.stats.additions}`,
              `Líneas Eliminadas: ${commit.stats.deletions}`,
              `Cobertura: ${commit.coverage}%`,
              `Total de Tests: ${commit.test_count}`,
            ];
          }
        }
      }
    }
  };

  const lineOptions: any = {
    scales: {
      x: { title: { display: true, text: "Commits" } },
      y: { title: { display: true } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const dataIndex = tooltipItem.dataIndex;
            const commit = commits[dataIndex];
            return [
              `Commit: ${commit.commit.message}`,
              `Líneas Añadidas: ${commit.stats.additions}`,
              `Líneas Eliminadas: ${commit.stats.deletions}`,
              `Cobertura: ${commit.coverage}%`,
              `Tests: ${commit.test_count}`,
            ];
          }
        }
      }
    }
  };

  const coverageData = {
    labels: commits.map((_, index) => `Commit ${index + 1}`),
    datasets: [{
      label: "Cobertura de Código",
      data: commits.map(commit => commit.coverage).reverse(),
      borderColor: "rgba(0, 200, 0, 0.7)",
      backgroundColor: "rgba(0, 200, 0, 0.2)",
      fill: true,
    }]
  };

  const modifiedLinesData = {
    labels: commits.map((_, index) => `Commit ${index + 1}`),
    datasets: [{
      label: "Líneas de Código Modificadas",
      data: commits.map(commit => commit.stats.total).reverse(),
      borderColor: "rgba(0, 0, 255, 0.7)",
      backgroundColor: "rgba(0, 0, 255, 0.2)",
      fill: true,
    }]
  };

  const testCountData = {
    labels: commits.map((_, index) => `Commit ${index + 1}`),
    datasets: [{
      label: "Total Número de Tests",
      data: commits.map(commit => commit.test_count).reverse(),
      borderColor: "rgba(255, 165, 0, 0.7)",
      backgroundColor: "rgba(255, 165, 0, 0.2)",
      fill: true,
    }]
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 1 }}>
        <h2>Métricas de Commits con Cobertura de Código</h2>
        <Bubble data={mainData} options={mainOptions} />
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
          <div style={{ width: "30%" }}>
            <h3>Cobertura de Código</h3>
            <Line data={coverageData} options={{ ...lineOptions, scales: { ...lineOptions.scales, y: { title: { text: "Cobertura (%)" } } } }} />
          </div>
          <div style={{ width: "30%" }}>
            <h3>Líneas de Código Modificadas</h3>
            <Line data={modifiedLinesData} options={{ ...lineOptions, scales: { ...lineOptions.scales, y: { title: { text: "Líneas Modificadas" } } } }} />
          </div>
          <div style={{ width: "30%" }}>
            <h3>Total Número de Tests</h3>
            <Line data={testCountData} options={{ ...lineOptions, scales: { ...lineOptions.scales, y: { title: { text: "Número de Tests" } } } }} />
          </div>
        </div>
      </div>
  
      <div style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "200px",
        marginLeft: "50px"
      }}>

        <div style={{
          width: "40px",
          height: "400px",
          background: "linear-gradient(to bottom, rgba(0,255,0,1), rgba(0,255,0,0))",
          textAlign: "center",
          position: "relative"
        }}>
          <p style={{ marginTop: '-60px', color: "#000", fontWeight: "bold", textAlign: "left"}}> Tests por Commit</p>
        </div>
  
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "300px",
          marginLeft: "10px",
          fontSize: "12px",
          color: "#000"
        }}>
          {labels.map(label => (
            <p key={label} style={{ margin: 0 }}>{label}</p>
          ))}
        </div>
      </div>
    </div>
  );
};  

export default TDDBoard;
