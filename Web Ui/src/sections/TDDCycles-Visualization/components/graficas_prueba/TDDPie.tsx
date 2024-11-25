import React, { useRef } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(Tooltip, Legend, ArcElement);

interface TDDPieProps {
  commits: { sha: string; commit: { message: string } }[];
  jobsByCommit: { sha: string; conclusion: string }[];
}

const TDDPie: React.FC<TDDPieProps> = ({ commits, jobsByCommit }) => {
  const chartRef = useRef<any>(null);

  function containsRefactor(commitMessage: string): boolean {
    const regex = /\brefactor(\w*)\b/i;
    return regex.test(commitMessage);
  }
  
  function getColorConclusion() {
    let categories = { green: 0, red: 0, blue: 0, black: 0 };

    commits.forEach((commit) => {
      const job = jobsByCommit.find((job) => job.sha === commit.sha);
      if (job?.conclusion === "success") {
        categories.green++;
      } else if (containsRefactor(commit.commit.message)) {
        categories.blue++;
      } else if (job) {
        categories.red++;
      } else {
        categories.black++;
      }
    });
    return categories;
  }

  const categories = getColorConclusion();
  const totalCommits = commits.length;

  const rawData = [
    (categories.green / totalCommits) * 100,
    (categories.red / totalCommits) * 100,
    (categories.blue / totalCommits) * 100,
    (categories.black / totalCommits) * 100,
  ];

  const allLabels = [
    "Éxito (Verde)",
    "Fallidos (Rojo)",
    "Refactorización (Azul)",
    "Sin Trabajo (Negro)",
  ];

  const allColors = ["#00ff00", "#ff0000", "#0000ff", "#000000"];

  // Filtrar datos para el gráfico (excluyendo 0%)
  const filteredData = rawData.filter((value) => value > 0);
  const filteredColors = allColors.filter((_, index) => rawData[index] > 0);

  const data = {
    labels: allLabels,
    datasets: [
      {
        label: "Porcentaje de Commits",
        data: filteredData, // Solo incluir valores mayores a 0 en el gráfico
        backgroundColor: filteredColors,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          generateLabels: (chart: any) => {
            return allLabels.map((label: string, index: number) => {
              const value = rawData[index];
              return {
                text: `${label}: ${value.toFixed(2)}%`,
                fillStyle: allColors[index],
              };
            });
          },
        },
      },
      tooltip: {
        enabled: false, 
      },
    },
    hover: {
      mode: undefined,
    },
    interaction: {
      mode: undefined, 
    },
    events: [], // Deshabilitar todos los eventos (click, hover, etc.)
    animation: {
      onComplete: function () {
        const chart = chartRef.current;
        if (!chart) return;

        const ctx = chart.ctx;
        const dataset = chart.data.datasets[0];
        const meta = chart.getDatasetMeta(0);

        meta.data.forEach((arc: any, index: number) => {
          const percentage = dataset.data[index].toFixed(2) + "%";
          const { x, y } = arc.tooltipPosition();
          ctx.fillStyle = "white";
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(percentage, x, y);
        });
      },
    },
  };

  return (
    <div style={{ width: "50%", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>Distribución de Commits</h3>
      <Pie ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default TDDPie;
