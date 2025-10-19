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

import { CommitCycle } from "../../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";

ChartJS.register(Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface TDDBarProps {
  CommitsCycles: CommitCycle[];
}

const TDDBar: React.FC<TDDBarProps> = ({ CommitsCycles }) => {
  

  function analyzeCycles() {
    let redGreen = 0;
    let lastRed = 0;
    let onlyGreen = 0;
    let noDateExtension = 0;
  
    CommitsCycles.forEach((commitcycle) => {
        switch(commitcycle.tddCylce){
          case "RojoVerde":
            redGreen ++;
            break;
          case "Rojo":
            lastRed ++;
            break;
          case "Verde":
            onlyGreen ++;
            break;
          case "null":
            noDateExtension ++;
            break;
        }
      });
    // Validación adicional para evitar divisiones por cero
    const totalCycles = redGreen + lastRed + onlyGreen + noDateExtension;
    if (totalCycles === 0) {
      return { redGreen: 0, lastRed: 0, onlyGreen: 0, noDateExtension: 100 }; 
    }
    return { redGreen, lastRed, onlyGreen, noDateExtension };
  }

  const { redGreen, lastRed, onlyGreen, noDateExtension } = analyzeCycles();
  const totalCycles = redGreen + lastRed + onlyGreen + noDateExtension;

  const rawData = [
    (redGreen / totalCycles) * 100,
    (lastRed / totalCycles) * 100,
    (onlyGreen / totalCycles) * 100,
    (noDateExtension / totalCycles) * 100,
  ];

  const labels = ["Commits con ciclos de TDD R-V",
      "Ultima ejecucion de pruebas rojo",
      "Ejecucion de pruebas de solo verde",
      "Sin información (VSCode TDDLab)"];
  const colors = ["#A9A9A9", "#ff0000", "#00ff00","#000000"];

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
      <h3 style={{ textAlign: "center" }}>Analisis de distribución de pruebas por commit </h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default TDDBar;