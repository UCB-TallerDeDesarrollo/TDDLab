import { testResult } from "../../../modules/TDDCycles-Visualization/application/commitExecutions";
import { TDDCommitLink } from "./TDDCommitMeta";
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Bubble } from "react-chartjs-2";
import type { TooltipItem } from "chart.js";
import type { CommitDataObject } from "../../../modules/TDDCycles-Visualization/domain/githubCommitInterfaces";

interface TimelineExecutionItem {
  success?: boolean;
  color?: string;
  numTotalTests?: number;
  number_of_tests?: number;
  numPassedTests?: number;
  passed_tests?: number;
  failedTests?: number;
  timestamp?: number;
  execution_timestamp?: Date;
}

interface TimelinePoint {
  x: number;
  y: number;
  r: number;
  isPassed: boolean | undefined;
  numTests?: number;
  passedTests?: number;
  failedTests?: number;
  date?: Date;
}

interface CommitTimelineDialogProps {
  open: boolean;
  handleCloseModal: () => void;
  selectedCommit: CommitDataObject | null;
  commitTimelineData: TimelineExecutionItem[];
  commitNumber?: number;
  branch?: string;
  branches?: string[];
  branchColorMap?: ReadonlyMap<string, string>;
}

const CommitTimelineDialog: React.FC<CommitTimelineDialogProps> = ({
  open,
  handleCloseModal,
  selectedCommit,
  commitTimelineData,
  commitNumber,
  branch,
  branches,
  branchColorMap,
}) => {
  const branchList = branches?.length ? branches : branch ? [branch] : [];

  // Preparar los datos para la visualización
  const prepareTimelineData = () => {
    if (!commitTimelineData || commitTimelineData.length === 0) return [];
    
    return commitTimelineData.map((item, index) => ({
      x: index + 1,
      y: 1,
      r: 15,
      // Si el dato viene del tdd_log.json:
      isPassed: item.success ?? (item.color === "green" ? true : item.color === "red" ? false : testResult(item) === "failure" ? false : undefined),
      numTests: item.numTotalTests ?? item.number_of_tests,
      passedTests: item.numPassedTests ?? item.passed_tests,
      failedTests: item.failedTests,
      date: item.timestamp != null ? new Date(item.timestamp) : item.execution_timestamp,
    }));
  };

  const timelineData = prepareTimelineData();

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="commit-details-dialog"
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          padding: "25px",
          borderRadius: "10px",
        },
      }}
    >
      <DialogTitle
        id="commit-details-dialog"
        style={{ textAlign: "center", fontSize: "2em", fontWeight: "bold" }}
      >
        {commitNumber ? `Timeline del commit ${commitNumber}` : "Timeline del commit"}
      </DialogTitle>
      <DialogContent>
        {selectedCommit?.sha && (
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "1.1em",
                overflowWrap: "anywhere",
                marginBottom: branchList.length > 0 ? "8px" : "10px",
              }}
            >
              <code title={selectedCommit.sha}>{selectedCommit.sha.slice(0, 7)}</code>
            </div>
            {branchList.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginBottom: "8px",
                }}
              >
                {branchList.map((branchName) => {
                  const accentColor = branchColorMap?.get(branchName) ?? "#378de5";
                  return (
                    <span
                      key={branchName}
                      title={branchName}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        maxWidth: "100%",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        backgroundColor: "#f0f7ff",
                        border: `1px solid ${accentColor}`,
                        color: "#092d4a",
                        fontSize: "0.85em",
                        fontWeight: 600,
                        overflowWrap: "anywhere",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: accentColor,
                          flexShrink: 0,
                        }}
                      />
                      <span>Rama: {branchName}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {timelineData.length > 0 ? (
          <div>
            <div style={{ width: "100%", height: "300px" }}>
              <Bubble
                data={{
                  datasets: [
                    {
                      label: "Ejecuciones de Tests",
                      data: timelineData,
                      backgroundColor: timelineData.map((item) =>
                        item.isPassed === undefined ? "#627384" : item.isPassed ? "#28A745" : "#D73A49"
                      ),
                      borderColor: timelineData.map((item) =>
                        item.isPassed === undefined ? "#627384" : item.isPassed ? "#28A745" : "#D73A49"
                      ),
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: "Ejecuciones de pruebas en este commit",
                      },
                      ticks: {
                        stepSize: 1,
                      },
                    },
                    y: {
                      title: {
                        display: false,
                      },
                      ticks: {
                        display: false,
                      },
                      min: 0.5,
                      max: 1.5,
                    },
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      enabled: true,
                      callbacks: {
                        label: function (context: TooltipItem<"bubble">) {
                          const dataPoint = context.raw as TimelinePoint;
                          const formatDate = (date?: Date): string => {
                            if (!date) return "Sin fecha";
                            const day = String(date.getDate()).padStart(2, "0");
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const year = date.getFullYear();
                            return `${day}/${month}/${year}`;
                          };

                          const formatTime = (date?: Date): string => {
                            if (!date) return "Sin hora";
                            const hours = String(date.getHours()).padStart(2, "0");
                            const minutes = String(date.getMinutes()).padStart(2, "0");
                            const seconds = String(date.getSeconds()).padStart(2, "0");
                            return `${hours}:${minutes}:${seconds}`;
                          };

                          return [
                            `Ejecución ${context.dataIndex + 1}`,
                            `Total Tests: ${dataPoint.numTests}`,
                            `Tests Pasados: ${dataPoint.passedTests}`,
                            `Tests Fallidos: ${dataPoint.failedTests ?? "Sin datos"}`,
                            `Estado: ${dataPoint.isPassed === undefined ? "Sin resultado" : dataPoint.isPassed ? "✓ Exitoso" : "✗ Fallido"}`,
                            `Fecha: ${formatDate(dataPoint.date)}`,
                            `Hora: ${formatTime(dataPoint.date)}`,
                          ];
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <p style={{ textAlign: "center", margin: "2em 0px 2em 0px" }}>
              No hay registros de ejecución para este commit.
            </p>
          </div>
        )}
        {selectedCommit?.commit?.message && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <strong>Mensaje del commit:</strong>
            <p style={{ fontStyle: "italic", marginTop: "5px" }}>
              {selectedCommit.commit.message}
            </p>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseModal} color="primary">
          Cerrar
        </Button>
        {selectedCommit?.html_url && <TDDCommitLink href={selectedCommit.html_url} />}
      </DialogActions>
    </Dialog>
  );
};

export default CommitTimelineDialog;
