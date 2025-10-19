import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Bubble } from "react-chartjs-2";
import FileUploadDialog from "../../Assignments/components/FileUploadDialog";

interface CommitTimelineDialogProps {
  open: boolean;
  handleCloseModal: () => void;
  handleOpenFileDialog: () => void;
  handleCloseFileDialog: () => void;
  handleFileUpload: (file: File) => Promise<void>;
  isFileDialogOpen: boolean;
  selectedCommit: any;
  commitTimelineData: any[];
  commits: any[];
}

const CommitTimelineDialog: React.FC<CommitTimelineDialogProps> = ({
  open,
  handleCloseModal,
  handleOpenFileDialog,
  handleCloseFileDialog,
  handleFileUpload,
  isFileDialogOpen,
  selectedCommit,
  commitTimelineData,
  commits,
}) => {
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
        {selectedCommit?.commit?.message && (
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "1.25em",
                marginBottom: "10px",
              }}
            >
              ({selectedCommit?.sha})
            </div>
          </div>
        )}
        {commitTimelineData.length > 0 ? (
          <div>
            <div style={{ width: "100%", height: "300px" }}>
              <Bubble
                data={{
                  datasets: [
                    {
                      label: "Ejecución",
                      data: commitTimelineData.map((item, index) => ({
                        x: index + 1,
                        y: 1,
                        r: 15,
                        backgroundColor:
                          item.color === "green" ? "#28A745" : "#D73A49",
                        borderColor:
                          item.color === "green" ? "#28A745" : "#D73A49",
                        numTests: item.number_of_tests,
                        passedTests: item.passed_tests,
                        date: item.execution_timestamp,
                      })),
                      backgroundColor: commitTimelineData.map((item) =>
                        item.color === "green" ? "#28A745" : "#D73A49"
                      ),
                      borderColor: commitTimelineData.map((item) =>
                        item.color === "green" ? "#28A745" : "#D73A49"
                      ),
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  scales: {
                    x: {
                      title: {
                        display: true,
                      },
                      ticks: {
                        display: false,
                      },
                    },
                    y: {
                      title: {
                        display: true,
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
                            const formatDate = (date: string | Date): string => {
                              const d = new Date(date);
                              const day = String(d.getDate()).padStart(2, '0');
                              const month = String(d.getMonth() + 1).padStart(2, '0');
                              const year = d.getFullYear();
                              return `${day}/${month}/${year}`;
                            };
                          
                            const formatTime = (date: string | Date): string => {
                              const d = new Date(date);
                              const hours = String(d.getHours()).padStart(2, '0');
                              const minutes = String(d.getMinutes()).padStart(2, '0');
                              return `${hours}:${minutes}`;
                            };
                          
                            return [
                              `Number of Tests: ${dataPoint.numTests}`,
                              `Passed Tests: ${dataPoint.passedTests}`,
                              `Fecha: ${formatDate(dataPoint.date)}`,
                              `Hora: ${formatTime(dataPoint.date)}`,
                            ];
                          },                          
                      },
                    },
                  },
                  elements: {
                    point: {
                      backgroundColor: (context: any) =>
                        context.raw.backgroundColor,
                      borderColor: (context: any) =>
                        context.raw.borderColor,
                      hoverBackgroundColor: (context: any) =>
                        context.raw.backgroundColor,
                      hoverBorderColor: (context: any) =>
                        context.raw.borderColor,
                      hoverRadius: 8,
                    },
                  },
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <p style={{ textAlign: "center", margin: "2em 0px 2em 0px" }}>
              No hay un registro de ejecución vinculante para este commit.
            </p>
            <div style={{ textAlign: "center", margin: "1em 0 1em 0" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenFileDialog}
              >
                Subir Sesión TDD
              </Button>
            </div>
            <FileUploadDialog
              open={isFileDialogOpen}
              onClose={handleCloseFileDialog}
              onUpload={handleFileUpload}
            />
          </div>
        )}
        {selectedCommit?.commit?.message && (
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <strong>Mensaje:</strong>
            <span style={{ fontStyle: "italic" }}>
              {selectedCommit.commit.message}
            </span>
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
          Ir al Commit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommitTimelineDialog;
