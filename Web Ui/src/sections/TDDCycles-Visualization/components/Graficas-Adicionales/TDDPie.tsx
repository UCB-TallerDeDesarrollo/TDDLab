import React, { useRef } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(Tooltip, Legend, ArcElement);

interface CommitDataObject {
  sha: string;
  commit: { message: string };
  coverage?: number | null;
}

interface TDDPieProps {
  commits: CommitDataObject[];
}

const TDDPie: React.FC<TDDPieProps> = ({ commits }) => {
  const chartRef = useRef<any>(null);

  function containsRefactor(commitMessage: string): boolean {
    const regex = /\brefactor(\w*)\b/i;
    return regex.test(commitMessage);
  }
  
  function getColorCategories() {
    let categories = { green: 0, red: 0, blue: 0, black: 0 };

    commits.forEach((commit) => {
      // Success: Has coverage data
      if (commit.coverage !== null && commit.coverage !== undefined) {
        if (containsRefactor(commit.commit.message)) {
          categories.blue++; // Refactoring commit with coverage
        } else {
          categories.green++; // Normal successful commit with coverage
        }
      } else if (containsRefactor(commit.commit.message)) {
        categories.blue++; // Refactoring commit (even without coverage)
      } else {
        categories.red++; // Failed commit (no coverage, not refactoring)
      }
    });
    return categories;
  }

  const categories = getColorCategories();
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
    "Sin Presentación (Negro)",
  ];

  const allColors = ["#00ff00", "#ff0000", "#0000ff", "#000000"];

  // Filter out categories with zero values
  const filteredIndices = rawData.map((value, index) => ({ value, index }))
    .filter(item => item.value > 0)
    .map(item => item.index);
  
  const filteredData = filteredIndices.map(index => rawData[index]);
  const filteredLabels = filteredIndices.map(index => allLabels[index]);
  const filteredColors = filteredIndices.map(index => allColors[index]);

  const data = {
    labels: filteredLabels,
    datasets: [
      {
        label: "Porcentaje de Commits",
        data: filteredData,
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
          generateLabels: () => {
            return filteredIndices.map((index) => {
              const value = rawData[index];
              return {
                text: `${allLabels[index]}: ${value.toFixed(2)}%`,
                fillStyle: allColors[index],
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw || 0;
            return `${value.toFixed(2)}%`;
          }
        }
      },
    },
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