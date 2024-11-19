
import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

ChartJS.register(Tooltip, Legend, ArcElement);

interface TDDPieProps {
  commits: CommitDataObject[];
}

const TDDPie: React.FC<TDDPieProps> = ({ commits }) => {
  // Calcula las categorías
  let getCommitCategories = () => {
    let categories = { green: 0, red: 0, blue: 0 };
    commits.forEach((commit) => {
      const message = commit.commit.message.toLowerCase();
      if (/\brefactor(\w*)\b/i.test(message)) {
        categories.blue++;
      } else if (commit.stats.total === 0) {
        categories.red++;
      } else {
        categories.green++;
      }
    });
    return categories;
  };

  const categories = getCommitCategories();
  const totalCommits = commits.length;

  const data = {
    labels: ["Éxito (Verde)", "Fallidos (Rojo)", "Refactorización (Azul)"],
    datasets: [
      {
        label: "Porcentaje de Commits",
        data: [
          (categories.green / totalCommits) * 100,
          (categories.red / totalCommits) * 100,
          (categories.blue / totalCommits) * 100,
        ],
        backgroundColor: ["#00ff00", "#ff0000", "#0000ff"],
        hoverBackgroundColor: ["#00cc00", "#cc0000", "#0000cc"],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(2)}%`;
          },
        },
      },
    },
  };

  return (
    <div style={{ width: "50%", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>Distribución de Commits</h3>
      <Pie data={data} options={options} />
    </div>
  );
};

export default TDDPie;
