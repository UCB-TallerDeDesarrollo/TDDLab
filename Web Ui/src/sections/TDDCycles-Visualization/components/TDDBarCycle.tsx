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
import { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";

ChartJS.register(Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface TDDBarProps {
  CommitsCycles: CommitCycle[];
}

const TDDBar: React.FC<TDDBarProps> = ({ CommitsCycles }) => {
  

  function analyzeCycles() {
    let tddCorrect = 0;
    let incorrect = 0;
  
    CommitsCycles.forEach((commitcycle) => {
        if(commitcycle.tddCylce){
            tddCorrect ++;
        }
        else{
            incorrect++;
        }
      });
    
  
    // Validación adicional para evitar divisiones por cero
    const totalCycles = tddCorrect + incorrect;
    if (totalCycles === 0) {
      return { tddCorrect: 0, incorrect: 100 }; 
    }
  
    return { tddCorrect, incorrect };
  }

  const { tddCorrect, incorrect } = analyzeCycles();
  const totalCycles = tddCorrect  + incorrect;

  const rawData = [
    (tddCorrect / totalCycles) * 100,
    (incorrect / totalCycles) * 100,
  ];

  const labels = ["Ciclos Correctos", "Casos Incorrectos"];
  const colors = ["#00ff00", "#ff0000"];

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