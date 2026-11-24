import { isCommitUrl } from "./isCommitUrl";
import { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";
import { CommitCycle } from "../../../modules/TDDCycles-Visualization/domain/TddCycleInterface";
import { getElementAtEvent, Line } from "react-chartjs-2";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDate } from '../../../modules/TDDCycles-Visualization/application/GetTDDCycles';

import {
  Chart as ChartJS,
  type Chart,
  type ChartData,
  type ChartOptions,
  type ScriptableLineSegmentContext,
  type TooltipItem,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  LineElement,
} from "chart.js";
import { getCommitNumbers } from "../../../modules/TDDCycles-Visualization/domain/commitNumbers";
import TDDList from "./TDDList";
import TDDBoard from "./TDDBoard";
import { CommitHistoryRepository } from "../../../modules/TDDCycles-Visualization/domain/CommitHistoryRepositoryInterface";
import TDDCycleChart from "./TDDCycleChart";
import { GitGraphCommit, TDDLogEntry } from "../../../modules/TDDCycles-Visualization/domain/TDDLogInterfaces";
import BranchFocusBar from "./BranchFocusBar";
import {
  type BranchMetadata,
  type BranchSelection,
  buildBranchMetadata,
  DIMMED_BORDER_COLOR,
  DIMMED_FILL_COLOR,
  formatCoverageLabel,
  getCommitBranchAccentColor,
  getCommitColor,
  getSharedActiveBranch,
  isCommitInActiveBranches,
  resolveActiveBranches,
  toggleBranchSelection,
} from "./branchVisualization";
import "../styles/TDDCommitHistory.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  LineElement
);

interface LineChartProps {
  filteredCommitsObject: CommitDataObject[] | null;
  tddLogs: TDDLogEntry[] | null;
  optionSelected: string;
  port: CommitHistoryRepository;
  role: string;
  commitsCycles: CommitCycle[] | null;
  gitGraph?: GitGraphCommit[];
  branchMeta?: BranchMetadata;
  selectedBranches?: ReadonlySet<string> | null;
  activeBranches?: ReadonlySet<string> | null;
  previewBranch?: string | "all" | null;
  onToggleBranch?: (branch: string) => void;
  onSelectAllBranches?: () => void;
  onPreviewBranch?: (branch: string | "all" | null) => void;
  onSelectMetric?: (metric: string) => void;
  logsError?: boolean;
}

function TDDLineCharts({
  filteredCommitsObject: commits,
  tddLogs,
  optionSelected,
  port,
  role,
  gitGraph,
  branchMeta: externalBranchMeta,
  selectedBranches: externalSelectedBranches,
  activeBranches: externalActiveBranches,
  previewBranch: externalPreviewBranch,
  onToggleBranch: externalToggleBranch,
  onSelectAllBranches: externalSelectAllBranches,
  onPreviewBranch: externalOnPreviewBranch,
  onSelectMetric,
  logsError = false,
}: LineChartProps) {
  const commitNumbers = useMemo(() => getCommitNumbers(commits ?? [], gitGraph), [commits, gitGraph]);
  const measuredShas = useMemo(
    () => new Set((commits ?? []).map((commit) => commit.sha)),
    [commits],
  );
  const fallbackBranchMeta = useMemo(
    () => buildBranchMetadata(gitGraph, measuredShas),
    [gitGraph, measuredShas],
  );
  const branchMeta = externalBranchMeta ?? fallbackBranchMeta;

  const [localSelection, setLocalSelection] = useState<BranchSelection>("auto");
  const [localPreview, setLocalPreview] = useState<string | "all" | null>(null);
  useEffect(() => {
    setLocalSelection("auto");
    setLocalPreview(null);
  }, [branchMeta.branchesKey]);

  const selectedBranches =
    externalSelectedBranches !== undefined
      ? externalSelectedBranches
      : resolveActiveBranches(localSelection, branchMeta);

  const previewBranch =
    externalPreviewBranch !== undefined ? externalPreviewBranch : localPreview;

  const activeBranches = useMemo<ReadonlySet<string> | null>(() => {
    if (externalActiveBranches !== undefined) return externalActiveBranches;
    if (previewBranch === "all") return null;
    if (previewBranch && branchMeta.branchColorMap.has(previewBranch)) {
      return new Set([previewBranch]);
    }
    return selectedBranches;
  }, [externalActiveBranches, previewBranch, branchMeta, selectedBranches]);

  const handleToggleBranch =
    externalToggleBranch ??
    ((branch: string) =>
      setLocalSelection((prev) => toggleBranchSelection(prev, branch, branchMeta)));

  const handleSelectAllBranches =
    externalSelectAllBranches ?? (() => setLocalSelection("all"));

  const handlePreviewBranch = externalOnPreviewBranch ?? setLocalPreview;

  const filteredCommitsObject = useMemo(
    () =>
      commits &&
      [...commits].sort(
        (a, b) => (commitNumbers.get(b.sha) ?? 0) - (commitNumbers.get(a.sha) ?? 0),
      ),
    [commits, commitNumbers],
  );
  const chronologicalCommits = useMemo(
    () => (filteredCommitsObject ?? []).slice().reverse(),
    [filteredCommitsObject],
  );

  const chartRef = useRef<Chart<"line", Array<number | null>>>();

  function getDataLabels() {
    return chronologicalCommits.map(
      (commit, index) => `Commit ${commitNumbers.get(commit.sha) ?? index + 1}`,
    );
  }

  function getCommitName() {
    return chronologicalCommits.map((commit) => commit.commit.message);
  }

  function getColorConclusion(): string[] {
    if (!filteredCommitsObject) return ["white"];

    return chronologicalCommits.map((commit) => {
      const isBranchActive = isCommitInActiveBranches(commit.sha, branchMeta, activeBranches);
      return isBranchActive ? getCommitColor(commit) : DIMMED_FILL_COLOR;
    });
  }

  function getCommitStats(): [number[], number[], number[], Date[]] {
    if (filteredCommitsObject != null) {
      const additions = chronologicalCommits.map((commit) => commit.stats.additions);
      const deletions = chronologicalCommits.map((commit) => commit.stats.deletions);
      const total = chronologicalCommits.map((commit) => commit.stats.total);
      const creation_date = chronologicalCommits.map((commit) => new Date(commit.commit.date));

      return [additions, deletions, total, creation_date];
    }
    return [[], [], [], []];
  }

  function getCommitCoverage(): Array<number | null> {
    if (filteredCommitsObject != null) {
      return chronologicalCommits.map((commit) => commit.coverage ?? null);
    }
    return [];
  }

  function getTestsCount() {
    if (filteredCommitsObject != null) {
      return chronologicalCommits.map((commit) => commit.test_count);
    }
    return [];
  }

  function getCommitLink() {
    if (filteredCommitsObject != null) {
      return chronologicalCommits.map((commit) => commit.html_url);
    }
    return [];
  }

  function getDataChart(
    dataChartSelected: Array<number | null>,
    dataLabel: string,
  ): ChartData<"line", Array<number | null>> {
    return {
      labels: getDataLabels(),
      datasets: [
        {
          label: dataLabel,
          spanGaps: false,
          backgroundColor: "rgba(0, 110, 0, 0.85)",
          pointBackgroundColor: getColorConclusion(),
          borderColor: "rgba(0, 0, 0, 0.2)",
          pointBorderColor: chronologicalCommits.map((commit) => {
            const isBranchActive = isCommitInActiveBranches(commit.sha, branchMeta, activeBranches);
            if (!isBranchActive) return DIMMED_BORDER_COLOR;
            const accent = getCommitBranchAccentColor(commit.sha, branchMeta, activeBranches);
            if (activeBranches !== null && accent) return accent;
            if (branchMeta.branches.length > 1 && accent) return accent;
            return "rgba(0, 0, 0, 0.2)";
          }),
          pointBorderWidth: chronologicalCommits.map((commit) => {
            const isBranchActive = isCommitInActiveBranches(commit.sha, branchMeta, activeBranches);
            if (!isBranchActive) return 1;
            const accent = getCommitBranchAccentColor(commit.sha, branchMeta, activeBranches);
            if (activeBranches !== null && accent) return 3;
            if (branchMeta.branches.length > 1 && accent) return 2;
            return 1;
          }),
          pointRadius: chronologicalCommits.map((commit) => {
            const isBranchActive = isCommitInActiveBranches(commit.sha, branchMeta, activeBranches);
            if (!isBranchActive) return 9;
            return activeBranches !== null ? 14 : 12;
          }),
          pointHoverRadius: 15,
          segment: {
            borderColor: (ctx: ScriptableLineSegmentContext) => {
              const from = chronologicalCommits[ctx.p0DataIndex];
              const to = chronologicalCommits[ctx.p1DataIndex];
              if (!from || !to) return "rgba(0, 0, 0, 0.2)";
              const fromActive = isCommitInActiveBranches(from.sha, branchMeta, activeBranches);
              const toActive = isCommitInActiveBranches(to.sha, branchMeta, activeBranches);
              if (!fromActive || !toActive) return "rgba(180, 180, 180, 0.2)";
              if (branchMeta.branches.length > 1) {
                const shared = getSharedActiveBranch(
                  from.sha,
                  to.sha,
                  branchMeta,
                  activeBranches,
                );
                if (shared) return branchMeta.branchColorMap.get(shared) ?? "rgba(5, 40, 69, 0.45)";
                return "rgba(130, 145, 160, 0.35)";
              }
              return "rgba(0, 0, 0, 0.2)";
            },
            borderDash: (ctx: ScriptableLineSegmentContext) => {
              const from = chronologicalCommits[ctx.p0DataIndex];
              const to = chronologicalCommits[ctx.p1DataIndex];
              if (!from || !to) return undefined;
              const fromActive = isCommitInActiveBranches(from.sha, branchMeta, activeBranches);
              const toActive = isCommitInActiveBranches(to.sha, branchMeta, activeBranches);
              if (!fromActive || !toActive) return [5, 5];
              if (
                branchMeta.branches.length > 1 &&
                !getSharedActiveBranch(from.sha, to.sha, branchMeta, activeBranches)
              ) {
                return [5, 5];
              }
              return undefined;
            },
          },
          data: dataChartSelected,
        },
      ],
    };
  }

  function getOptionsChart(axisText: string): ChartOptions<"line"> {
    const optionsLineChart: ChartOptions<"line"> = {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Commits Realizados",
            font: {
              size: 20,
              lineHeight: 1.2,
            },
          },
        },
        y: {
          title: {
            display: true,
            text: axisText,
            font: {
              size: 20,
              lineHeight: 1.2,
            },
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (context: TooltipItem<"line">[]) {
              return `${getDataLabels()[context[0].dataIndex]}: ${
                getCommitName()[context[0].dataIndex]
              }`;
            },
            afterBody: function (context: TooltipItem<"line">[]) {
              const index = context[0].dataIndex;
              const stats = getCommitStats();
              const commit = chronologicalCommits[index];
              const afterBodyContent: string[] = [
                `Líneas de Código Añadido: ${stats[0][index]}`,
                `Líneas de Código Eliminado: ${stats[1][index]}`,
                `Total de Cambios: ${stats[2][index]}`,
                `Fecha: ${formatDate(stats[3][index])}`,
                `Cobertura: ${formatCoverageLabel(commit?.coverage)}`,
              ];

              const commitBranches = commit
                ? branchMeta.commitBranchMap.get(commit.sha)
                : undefined;
              if (commitBranches?.length) {
                afterBodyContent.push(`Rama: ${commitBranches.join(", ")}`);
              }

              return afterBodyContent;
            },
          },
        },
      },
    };
    return optionsLineChart;
  }

  const onClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!chartRef.current) return;
    const elements = getElementAtEvent(chartRef.current, event);
    if (elements.length > 0) {
      const dataPoint = elements[0].index;
      const link = getCommitLink()[dataPoint];
      if (link && isCommitUrl(link)) {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    }
  };

  function getLineChart() {
    let chartData: ChartData<"line", Array<number | null>> | null = null;
    let optionsChart: ChartOptions<"line"> | undefined;
    let dataTestid = "";
    switch (optionSelected) {
      case "Cobertura de Código":
        chartData = getDataChart(
          getCommitCoverage(),
          "Porcentaje de Cobertura de Código"
        );
        optionsChart = getOptionsChart("Cobertura de Código");
        dataTestid = "graph-coverage";
        break;
      case "Líneas de Código Modificadas":
        chartData = getDataChart(
          getCommitStats()[2],
          "Total de Líneas de Código Modificadas"
        );
        optionsChart = getOptionsChart("Líneas de Código Modificadas");
        dataTestid = "graph-linesModified";
        break;
      case "Total Número de Tests":
        chartData = getDataChart(getTestsCount(), "Total Número de Tests");
        optionsChart = getOptionsChart("Número de Tests");
        dataTestid = "graph-testCount";
        break;
      case "Lista":
        return <TDDList commitsInfo={commits ?? []} gitGraph={gitGraph} />;
      case "Dashboard":
        return (
          <TDDBoard
            commits={filteredCommitsObject || []}
            commitNumbers={commitNumbers}
            gitGraph={gitGraph}
            tddLogs={tddLogs || []}
            port={port}
            role={role}
            branchMeta={branchMeta}
            selectedBranches={selectedBranches}
            activeBranches={activeBranches}
            previewBranch={previewBranch}
            onToggleBranch={handleToggleBranch}
            onSelectAllBranches={handleSelectAllBranches}
            onPreviewBranch={handlePreviewBranch}
            onSelectMetric={onSelectMetric}
            logsError={logsError}
          />
        );
      case "Ciclo de ejecución de pruebas":
        return (
          <>
            <div className="tdd-single-view-branch-bar">
              <BranchFocusBar
                meta={branchMeta}
                selectedBranches={selectedBranches}
                previewBranch={previewBranch}
                onToggleBranch={handleToggleBranch}
                onSelectAll={handleSelectAllBranches}
                onPreviewBranch={handlePreviewBranch}
                onViewHistory={onSelectMetric ? () => onSelectMetric("Lista") : undefined}
              />
            </div>
            <TDDCycleChart
              data={tddLogs ?? []}
              commitNumbers={commitNumbers}
              gitGraph={gitGraph}
              branchMeta={branchMeta}
              activeBranches={activeBranches}
              logsError={logsError}
            />
          </>
        );
    }
    return (
      <>
        <div className="tdd-single-view-branch-bar">
          <BranchFocusBar
            meta={branchMeta}
            selectedBranches={selectedBranches}
            previewBranch={previewBranch}
            onToggleBranch={handleToggleBranch}
            onSelectAll={handleSelectAllBranches}
            onPreviewBranch={handlePreviewBranch}
            onViewHistory={onSelectMetric ? () => onSelectMetric("Lista") : undefined}
          />
        </div>
        {chartData && (
          <Line
            height="100"
            data={chartData}
            options={optionsChart}
            onClick={onClick}
            ref={chartRef}
            data-testid={dataTestid}
          />
        )}
      </>
    );
  }

  return getLineChart();
}

export default TDDLineCharts;
