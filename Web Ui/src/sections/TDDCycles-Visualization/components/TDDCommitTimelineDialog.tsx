import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Bubble } from "react-chartjs-2";

interface CommitTimelineDialogProps {
  open: boolean;
  handleCloseModal: () => void;
  selectedCommit: any;
  commitTimelineData: any[];
  commits: any[];
}

const CommitTimelineDialog: React.FC<CommitTimelineDialogProps> = ({
  open,
  handleCloseModal,
  selectedCommit,
  commitTimelineData,
  commits,
}) => {

  // Preparar los datos para la visualización
  const prepareTimelineData = () => {
    if (!commitTimelineData || commitTimelineData.length === 0) return [];
    
    return commitTimelineData.map((item, index) => ({
      x: index + 1,
      y: 1,
      r: 15,
      // Si el dato viene del tdd_log.json:
      isPassed: item.success ?? (item.color === "green"),
      numTests: item.numTotalTests ?? item.number_of_tests,
      passedTests: item.numPassedTests ?? item.passed_tests,
      failedTests: item.failedTests,
      date: item.timestamp ? new Date(item.timestamp) : item.execution_timestamp,
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
        {`Timeline del commit ${
          commits.length - commits.findIndex((commit) => commit.sha === selectedCommit?.sha)
        } `}
      </DialogTitle>
      <DialogContent>
        {selectedCommit?.sha && (
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "1.25em",
                marginBottom: "10px",
              }}
            >
              ({selectedCommit.sha})
            </div>
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
                        item.isPassed ? "#28A745" : "#D73A49"
                      ),
                      borderColor: timelineData.map((item) =>
                        item.isPassed ? "#28A745" : "#D73A49"
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
                        label: function (context: any) {
                          const dataPoint = context.raw;
                          const formatDate = (date: Date): string => {
                            const day = String(date.getDate()).padStart(2, "0");
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const year = date.getFullYear();
                            return `${day}/${month}/${year}`;
                          };

                          const formatTime = (date: Date): string => {
                            const hours = String(date.getHours()).padStart(2, "0");
                            const minutes = String(date.getMinutes()).padStart(2, "0");
                            const seconds = String(date.getSeconds()).padStart(2, "0");
                            return `${hours}:${minutes}:${seconds}`;
                          };

                          return [
                            `Ejecución ${context.dataIndex + 1}`,
                            `Total Tests: ${dataPoint.numTests}`,
                            `Tests Pasados: ${dataPoint.passedTests}`,
                            `Tests Fallidos: ${dataPoint.failedTests || 0}`,
                            `Estado: ${dataPoint.isPassed ? "✓ Exitoso" : "✗ Fallido"}`,
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
        <Button
          onClick={() => {
            if (selectedCommit?.html_url) {
              window.open(selectedCommit.html_url, "_blank");
            }
          }}
          color="primary"
          variant="contained"
        >
          Ir al Commit en GitHub
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommitTimelineDialog;
