import React from "react";
import { Bar } from "react-chartjs-2";
import { TddCycle } from "../../../../modules/TDDCycles-Visualization/domain/TddcycleInterface";
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
  tddCycles : TddCycle[];
}

const TDDBar: React.FC<TDDBarProps> = ({ tddCycles }) => {
  

  function analyzeCycles() {
    let tddCorrect = 0;
    let nodata = 0;
    let incorrect = 0;
  
    tddCycles.forEach((tddCycle) => {
      if(tddCycle.tddcycle){
        tddCorrect++;
      }
      else if(!tddCycle.tddcycle){
        incorrect++;
      }
      else{
        nodata++;
      }
    });
    return {tddCorrect, nodata, incorrect};
  }

  const { tddCorrect, nodata, incorrect } = analyzeCycles();
  const totalCycles = tddCorrect + nodata + incorrect;

  const rawData = [
    (tddCorrect / totalCycles) * 100,
    (nodata / totalCycles) * 100,
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
