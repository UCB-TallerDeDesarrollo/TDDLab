import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Chip
} from "@mui/material";
import { Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  LinearScale,
  PointElement,
} from "chart.js";
import { ProcessedTest } from '../../../modules/TDDCycles-Visualization/domain/ProcessedTDDLogInterfaces';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

interface CommitTimelineDialogProps {
  open: boolean;
  handleCloseModal: () => void;
  selectedCommit: any;
  commitTimelineData: ProcessedTest[];
  commits: any[];
}

const CommitTimelineDialog: React.FC<CommitTimelineDialogProps> = ({
  open,
  handleCloseModal,
  selectedCommit,
  commitTimelineData,
  commits,
}) => {

  const prepareTimelineData = () => {
    if (!commitTimelineData || commitTimelineData.length === 0) return [];

    return commitTimelineData.map((item, index) => ({
      x: index + 1,
      y: 1, 
      r: 0, 
      isPassed: item.success,
      numTests: item.numTotalTests,
      passedTests: item.numPassedTests,
      failedTests: item.failedTests,
      date: new Date(item.timestamp),
    }));
  };

  const timelineData = prepareTimelineData();

  // Plugin personalizado
  const customIconPlugin = {
    id: 'customIcons',
    afterDatasetsDraw(chart: any) {
      const { ctx } = chart;
      
      chart.data.datasets.forEach((dataset: any, i: number) => {
        const meta = chart.getDatasetMeta(i);
        
        meta.data.forEach((element: any, index: number) => {
          const dataItem = dataset.data[index];
          const { x, y } = element.tooltipPosition();

          ctx.save();
          
          // CAMBIO 1: Aumentamos el tamaño de 24px a 36px
          ctx.font = 'bold 36px Arial'; 
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          if (dataItem.isPassed) {
            ctx.fillStyle = '#28A745'; 
            ctx.fillText('✔', x, y);
          } else {
            ctx.fillStyle = '#D73A49'; 
            ctx.fillText('✖', x, y);
          }
          
          ctx.restore();
        });
      });
    }
  };

  const commitIndex = commits.length - commits.findIndex((commit) => commit.sha === selectedCommit?.sha);

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="commit-details-dialog"
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiDialog-paper": {
          padding: "10px",
          borderRadius: "16px",
        },
      }}
    >
      <DialogTitle id="commit-details-dialog">
        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
          <Typography variant="h5" component="span" fontWeight="bold" color="primary">
            Timeline de Ejecución
          </Typography>
          <Chip 
            label={`Commit #${commitIndex}`} 
            color="primary" 
            variant="outlined" 
            size="small" 
          />
        </Box>
      </DialogTitle>

      <Divider variant="middle" />

      <DialogContent>
        {selectedCommit?.commit?.message && (
          <Box mb={4} textAlign="center">
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mensaje del commit:
            </Typography>
            <Typography variant="h6" component="p" fontStyle="italic">
              "{selectedCommit.commit.message}"
            </Typography>
          </Box>
        )}

        {timelineData.length > 0 ? (
          <Box height={300} width="100%" display="flex" alignItems="center" justifyContent="center">
            <Bubble
              data={{
                datasets: [
                  {
                    label: "Ejecuciones",
                    data: timelineData,
                    // Aumentamos el radio de interacción porque el icono es más grande
                    hitRadius: 40, 
                    hoverRadius: 40, 
                    backgroundColor: "transparent", 
                    borderColor: "transparent",
                  },
                ],
              }}
              plugins={[customIconPlugin]}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: "Secuencia de ejecuciones",
                      font: { size: 14, weight: 'bold' }
                    },
                    ticks: { stepSize: 1 },
                    grid: { display: false },
                    // CAMBIO 2: Lógica de espaciado
                    // min: 0 asegura margen izquierdo.
                    // max: fuerza al eje a tener AL MENOS espacio para 6 items.
                    // Si tienes 2 items, ocuparán las posiciones 1 y 2 de 6 (juntos a la izquierda).
                    // Si tienes 10 items, el eje crecerá a 11 (se ajusta normalmente).
                    min: 0,
                    max: Math.max(timelineData.length + 1, 6),
                  },
                  y: {
                    display: false,
                    min: 0.5,
                    max: 1.5,
                  },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                      label: function (context: any) {
                        const dataPoint = context.raw;
                        const dateObj = dataPoint.date;
                        
                        return [
                          `Ejecución #${context.dataIndex + 1}`,
                          `--------------------------`,
                          `Estado: ${dataPoint.isPassed ? "✓ PASÓ" : "✗ FALLÓ"}`,
                          `Total Tests: ${dataPoint.numTests}`,
                          `Pasados: ${dataPoint.passedTests}`,
                          `Fallidos: ${dataPoint.failedTests}`,
                          `Hora: ${dateObj.toLocaleTimeString()}`,
                        ];
                      },
                    },
                  },
                },
              }}
            />
          </Box>
        ) : (
          <Box py={5} display="flex" justifyContent="center">
            <Typography color="text.secondary">
              No hay registros de ejecución de pruebas para este commit.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
        <Button onClick={handleCloseModal} color="inherit">
          Cerrar
        </Button>
        <Button
          onClick={() => {
            if (selectedCommit?.html_url) {
              window.open(selectedCommit.html_url, "_blank");
            }
          }}
          variant="contained"
          color="primary"
          sx={{ borderRadius: "20px", textTransform: "none", px: 3 }}
        >
          Ver en GitHub
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CommitTimelineDialog;