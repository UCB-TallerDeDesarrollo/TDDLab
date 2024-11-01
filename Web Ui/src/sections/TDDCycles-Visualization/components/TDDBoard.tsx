import React from "react";
import { Bubble } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../modules/TDDCycles-Visualization/domain/jobInterfaces";

// Registramos los componentes de ChartJS necesarios para el gráfico
ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, PointElement);

interface CycleReportViewProps {
  commits: CommitDataObject[];
  jobsByCommit: JobDataObject[];
}

const TDDBoard: React.FC<CycleReportViewProps> = ({ commits, jobsByCommit }) => {
  // Calcula el mínimo y máximo de test_count para normalizar los colores
  const testCounts = commits.map(commit => commit.test_count);
  const minTestCount = Math.min(...testCounts);
  const maxTestCount = Math.max(...testCounts);

  // Función para calcular el color según el valor de test_count y el resultado del commit
  const getColorByTestCountAndConclusion = (testCount: number, conclusion: string) => {
    const intensity = (testCount - minTestCount) / (maxTestCount - minTestCount); // Valor entre 0 y 1

    if (conclusion === "success") {
      return `rgba(0, ${Math.floor(255 * intensity)}, 0, 0.7)`; // Verde que varía en intensidad
    } else {
      return `rgba(${Math.floor(255 * intensity)}, 0, 0, 0.7)`; // Rojo que varía en intensidad
    }
  };

  const data = {
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

  const options: any = {
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

  return (
    <div>
      <h2>Métricas de Commits con Cobertura de Código</h2>
      <Bubble data={data} options={options} />
    </div>
  );
};

export default TDDBoard;
