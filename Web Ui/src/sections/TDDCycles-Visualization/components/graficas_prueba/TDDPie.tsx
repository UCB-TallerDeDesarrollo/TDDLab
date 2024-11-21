
import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { CommitDataObject } from "../../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { JobDataObject } from "../../../../modules/TDDCycles-Visualization/domain/jobInterfaces";
import { GithubAPIRepository } from "../../../../modules/TDDCycles-Visualization/domain/GithubAPIRepositoryInterface";

ChartJS.register(Tooltip, Legend, ArcElement);

interface TDDPieProps {
  commits: CommitDataObject[];
  jobsByCommit: JobDataObject[];
  port: GithubAPIRepository;
  role: string;
}

const TDDPie: React.FC<TDDPieProps> = ({ commits, jobsByCommit }) => {
  // Calcula las categorías
  function containsRefactor(commitMessage: string): boolean {
    const regex = /\brefactor(\w*)\b/i;
    return regex.test(commitMessage);
  }

  function getColorConclusion() {
    let categories = { green: 0, red: 0, blue: 0 };

    commits.map((commit) => {
              const job = jobsByCommit.find((job) => job.sha === commit.sha);
              if (job?.conclusion === "success") categories.green++;
              else if (job === undefined) return "black";
              else if (containsRefactor(commit.commit.message)) categories.blue++;
              else categories.red++;
            })
            return categories;
  }

  const categories = getColorConclusion();
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
