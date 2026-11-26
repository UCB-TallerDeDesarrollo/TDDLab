import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  TooltipItem,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

ChartJS.register(Tooltip, Legend, ArcElement);

interface TDDPieProps {
  commits: CommitDataObject[];
}

function TDDPie({ commits }: Readonly<TDDPieProps>) {
  const categories = commits.reduce(
    (result, commit) => {
      const { coverage, test_count, conclusion, commit: commitInfo } = commit;
      const isRefactor = /\brefactor(\w*)\b/i.test(commitInfo.message);

      if (coverage === undefined || coverage === null) {
        result.black += 1;
      } else if (
        test_count === 0 ||
        coverage === 0 ||
        conclusion === "failure"
      ) {
        result.red += 1;
      } else if (isRefactor) {
        result.blue += 1;
      } else {
        result.green += 1;
      }
      return result;
    },
    { green: 0, red: 0, blue: 0, black: 0 },
  );
  const totalCommits = commits.length;
  const percentages = [
    categories.green,
    categories.red,
    categories.blue,
    categories.black,
  ].map((count) => (totalCommits === 0 ? 0 : (count / totalCommits) * 100));
  const labels = [
    "Éxito (Verde)",
    "Fallidos (Rojo)",
    "Refactorización (Azul)",
    "Sin Presentación (Negro)",
  ];
  const colors = ["#00ff00", "#ff0000", "#0000ff", "#000000"];
  const visibleIndices = percentages
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => value > 0)
    .map(({ index }) => index);
  const data = {
    labels: visibleIndices.map((index) => labels[index]),
    datasets: [
      {
        label: "Porcentaje de Commits",
        data: visibleIndices.map((index) => percentages[index]),
        backgroundColor: visibleIndices.map((index) => colors[index]),
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          generateLabels: () =>
            visibleIndices.map((index) => ({
              text: `${labels[index]}: ${percentages[index].toFixed(2)}%`,
              fillStyle: colors[index],
            })),
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"pie">) => {
            const value = typeof context.raw === "number" ? context.raw : 0;
            return `${value.toFixed(2)}%`;
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
}

export default TDDPie;
