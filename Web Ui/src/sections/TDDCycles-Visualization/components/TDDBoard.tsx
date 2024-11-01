import React from "react";
import { Bubble, Line } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";

// Registrar los componentes de ChartJS necesarios para el gráfico
ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

interface CycleReportViewProps {
  commits: CommitDataObject[];
  jobsByCommit: JobDataObject[];
}

const TDDBoard: React.FC<CycleReportViewProps> = ({ commits, jobsByCommit }) => {
  // Configuración para el gráfico principal de métricas generales
  const testCounts = commits.map(commit => commit.test_count);
  const minTestCount = Math.min(...testCounts);
  const maxTestCount = Math.max(...testCounts);

  const getColorByTestCountAndConclusion = (testCount: number, conclusion: string) => {
    const intensity = (testCount - minTestCount) / (maxTestCount - minTestCount);
    return conclusion === "success"
      ? `rgba(0, ${Math.floor(255 * intensity)}, 0, 0.7)`
      : `rgba(${Math.floor(255 * intensity)}, 0, 0, 0.7)`;
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
      x: { title: { display: true, text: "Commits" }, ticks: { callback: (value: any) => `Commit ${value}` } },
      y: { title: { display: true, text: "Cobertura de Pruebas (%)" }, min: 70, max: 110, suggestedMax: 120 }
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

  // Datos para los gráficos de líneas
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
    <div>
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
  );
};

export default TDDBoard;
