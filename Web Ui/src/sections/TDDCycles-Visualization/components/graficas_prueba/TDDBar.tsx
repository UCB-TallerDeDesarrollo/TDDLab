import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface TDDBarProps {
  commits: { sha: string; commit: { message: string } }[];
  jobsByCommit: { sha: string; conclusion: string }[];
}

const TDDBar: React.FC<TDDBarProps> = ({ commits, jobsByCommit }) => {
  function containsRefactor(commitMessage: string): boolean {
    const regex = /\brefactor(\w*)\b/i;
    return regex.test(commitMessage);
  }

  function analyzeCycles() {
    let tddCorrect = 0;
    let refactorIdeal = 0;
    let incorrect = 0;
  
    for (let i = 0; i < commits.length - 1; i++) {
      const current = commits[i];
      const next = commits[i + 1];
      const currentJob = jobsByCommit.find((job) => job.sha === current.sha);
      const nextJob = jobsByCommit.find((job) => job.sha === next.sha);
  
      const isRed = currentJob?.conclusion === "failure";
      const isGreen = currentJob?.conclusion === "success";
      const isNextGreen = nextJob?.conclusion === "success";
      const isRefactor = containsRefactor(next.commit.message);
  
      if (isRed && isNextGreen) {
        // Ciclo correcto: Rojo seguido de Verde
        tddCorrect++;
      } else if (isGreen && isRefactor) {
        // Refactor ideal: Verde seguido de Refactor (sin requerir que el siguiente commit sea verde)
        refactorIdeal++;
      } else {
        incorrect++;
      }
    }
  
    // Validación adicional para evitar divisiones por cero
    const totalCycles = tddCorrect + refactorIdeal + incorrect;
    if (totalCycles === 0) {
      return { tddCorrect: 0, refactorIdeal: 0, incorrect: 100 }; 
    }
  
    return { tddCorrect, refactorIdeal, incorrect };
  }

  const { tddCorrect, refactorIdeal, incorrect } = analyzeCycles();
  const totalCycles = tddCorrect + refactorIdeal + incorrect;

  const rawData = [
    (tddCorrect / totalCycles) * 100,
    (refactorIdeal / totalCycles) * 100,
    (incorrect / totalCycles) * 100,
  ];

  const labels = ["Ciclos Correctos", "Refactor Ideal", "Casos Incorrectos"];
  const colors = ["#00ff00", "#0000ff", "#ff0000"];

  const data = {
    labels,
    datasets: [
      {
        label: "Porcentaje de Ciclos TDD",
        data: rawData,
        backgroundColor: colors,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const value = context.raw.toFixed(2);
            return `${context.label}: ${value}%`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "category" as const, 
        title: {
          display: true,
          text: "Categorías",
        },
      },
      y: {
        type: "linear" as const, 
        title: {
          display: true,
          text: "Porcentaje (%)",
        },
        beginAtZero: true, 
        suggestedMax: 100, 
      },
    },
  };
  

  return (
    <div style={{ width: "60%", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>Análisis de Ciclos de TDD</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default TDDBar;
