import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Legend,
  Tooltip,
  TooltipItem,
} from "chart.js";
import { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";

ChartJS.register(Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface TDDBarCycleProps {
  commitsCycles: CommitCycle[];
}

function TDDBarCycle({ commitsCycles }: Readonly<TDDBarCycleProps>) {
  const counts = commitsCycles.reduce(
    (result, commitCycle) => {
      switch (commitCycle.tddCycle) {
        case "RojoVerde":
          result.redGreen += 1;
          break;
        case "Rojo":
          result.red += 1;
          break;
        case "Verde":
          result.green += 1;
          break;
        case "null":
          result.noData += 1;
          break;
      }
      return result;
    },
    { redGreen: 0, red: 0, green: 0, noData: 0 },
  );
  const totalCycles = counts.redGreen + counts.red + counts.green + counts.noData;
  const percentages = totalCycles === 0
    ? [0, 0, 0, 0]
    : [
        (counts.redGreen / totalCycles) * 100,
        (counts.red / totalCycles) * 100,
        (counts.green / totalCycles) * 100,
        (counts.noData / totalCycles) * 100,
      ];

  const data = {
    labels: [
      "Commits con ciclos de TDD R-V",
      "Última ejecución de pruebas rojo",
      "Ejecución de pruebas solo verde",
      "Sin información (VSCode TDDLab)",
    ],
    datasets: [
      {
        label: "Porcentaje de Ciclos TDD",
        data: percentages,
        backgroundColor: ["#A9A9A9", "#ff0000", "#00ff00", "#000000"],
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
        label: (context: TooltipItem<"bar">) => {
          const value = typeof context.raw === "number" ? context.raw : 0;
          return `${context.label}: ${value.toFixed(2)}%`;
        },
        },
      },
    },
    scales: {
      x: {
        type: "category" as const,
        title: { display: true, text: "Categorías" },
      },
      y: {
        type: "linear" as const,
        title: { display: true, text: "Porcentaje (%)" },
        beginAtZero: true,
        suggestedMax: 100,
      },
    },
  };

  return (
    <div style={{ width: "60%", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>
        Análisis de distribución de pruebas por commit
      </h3>
      <Bar data={data} options={options} />
    </div>
  );
}

export default TDDBarCycle;
