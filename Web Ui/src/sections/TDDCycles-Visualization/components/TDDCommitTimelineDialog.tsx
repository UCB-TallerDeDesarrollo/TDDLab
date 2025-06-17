import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { Line } from 'react-chartjs-2';
import { useSearchParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

// Imports de la arquitectura hexagonal
import { TddLogAdapter } from '../../../modules/TDDCycles-Visualization/repository/TddLogAdapter';
import { GetTDDLog } from '../../../modules/TDDCycles-Visualization/application/GetTDDLog';
import { TDDLogCycleData } from '../../../modules/TDDCycles-Visualization/domain/TddLogInterface';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CommitTimelineDialogProps {
  open: boolean;
  handleCloseModal: () => void;
  selectedCommit: any;
  commits: any[];
}

const TDDCommitTimelineDialog: React.FC<CommitTimelineDialogProps> = ({
  open,
  handleCloseModal,
  selectedCommit,
  commits,
}) => {
  const [tddCycleData, setTddCycleData] = useState<TDDLogCycleData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  
  const repoOwner = searchParams.get("repoOwner");
  const repoName = searchParams.get("repoName");

  const tddLogAdapter = new TddLogAdapter();
  const getTDDLogUseCase = new GetTDDLog(tddLogAdapter);

  useEffect(() => {
    if (selectedCommit?.sha && open) {
      loadTDDCycle();
    }
  }, [selectedCommit, open]);

  const loadTDDCycle = async () => {
    if (!selectedCommit?.sha || !repoOwner || !repoName) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const cycleData = await getTDDLogUseCase.execute(repoOwner, repoName, selectedCommit.sha);
      
      if (cycleData && cycleData.length > 0) {
        setTddCycleData(cycleData);
      } else {
        setTddCycleData([]);
      }
    } catch (err: any) {
      const errorMessage = `Error al cargar los datos del ciclo TDD: ${err.message || err}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  const getTestResultColor = (data: TDDLogCycleData): string => {
    if (data.phase === 'REFACTOR') {
      return '#007BFF'; // Azul para refactoring
    }
    
    if (data.numPassedTests === 0) {
      return '#DC3545'; // Rojo - todas las pruebas fallan
    }
    
    if (data.numPassedTests === data.numTotalTests) {
      return '#28A745'; // Verde - todas las pruebas pasan
    }
    
    return '#FFC107'; // Amarillo - algunas pasan y otras fallan
  };

  const getPointRadius = (numTotalTests: number): number => {
    // Tamaño base mínimo de 4, máximo de 16
    const minRadius = 4;
    const maxRadius = 16;
    const baseRadius = 8;
    
    if (numTotalTests === 0) return minRadius;
    
    // Escala logarítmica para mejor visualización
    const scaledRadius = Math.min(maxRadius, Math.max(minRadius, baseRadius + Math.log(numTotalTests) * 2));
    return scaledRadius;
  };

  const renderTDDChart = () => {
    if (tddCycleData.length === 0) return null;

    const chartData = {
      labels: tddCycleData.map((_, index) => `Paso ${index + 1}`),
      datasets: [
        {
          label: 'Tests Pasados',
          data: tddCycleData.map(item => item.numPassedTests),
          borderColor: '#666666',
          backgroundColor: 'transparent',
          fill: false,
          showLine: false,
          pointRadius: tddCycleData.map(item => getPointRadius(item.numTotalTests)),
          pointHoverRadius: tddCycleData.map(item => getPointRadius(item.numTotalTests) + 4),
          pointBackgroundColor: tddCycleData.map(item => getTestResultColor(item)),
          pointBorderColor: tddCycleData.map(item => getTestResultColor(item)),
          pointBorderWidth: 2,
        }
      ],
    };

    const options: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              const index = context[0].dataIndex;
              const data = tddCycleData[index];
              return `${data.phase} - ${formatTime(data.timestamp)}`;
            },
            label: function(context) {
              const index = context.dataIndex;
              const data = tddCycleData[index];
              
              return [
                `Tests pasados: ${data.numPassedTests}`,
                `Total tests: ${data.numTotalTests}`,
                `Fase: ${data.phase}`,
                `Estado: ${data.success ? 'Éxito' : 'Fallo'}`
              ];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Tests Pasados'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Progresión del Ciclo TDD'
          }
        }
      }
    };

    return (
      <div style={{ width: '100%', height: '400px' }}>
        <Line data={chartData} options={options} />
        
        {/* Leyenda de colores */}
        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: '15px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#DC3545', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: '500' }}>Todas fallan</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#28A745', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: '500' }}>Todas pasan</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#FFC107', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: '500' }}>Parcial</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#007BFF', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: '500' }}>Refactor</span>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box display="flex" flexDirection="column" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="body1" style={{ marginTop: '16px' }}>
            Cargando datos del ciclo TDD...
          </Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box textAlign="center" py={4}>
          <Alert severity="error" style={{ marginBottom: '16px' }}>
            {error}
          </Alert>
          <Button 
            variant="outlined" 
            onClick={loadTDDCycle}
            style={{ marginTop: '16px' }}
          >
            Reintentar
          </Button>
        </Box>
      );
    }

    if (tddCycleData.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Alert severity="info" style={{ marginBottom: '16px' }}>
            No se encontraron datos del ciclo TDD para este commit.
          </Alert>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Commit ID: {selectedCommit?.sha?.substring(0, 8)}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={loadTDDCycle}
            style={{ marginTop: '16px' }}
          >
            Reintentar
          </Button>
        </Box>
      );
    }

    return (
      <div>
        <Typography variant="h6" gutterBottom style={{ textAlign: 'center', marginBottom: '20px' }}>
          Ciclo TDD - {tddCycleData.length} pasos detectados
        </Typography>
        
        <Alert severity="success" style={{ marginBottom: '16px' }}>
          ✅ Encontrados {tddCycleData.length} pasos del ciclo TDD
        </Alert>
        
        {renderTDDChart()}
        
        {/* Resumen del ciclo */}
        <Box mt={3} p={2} bgcolor="background.paper" borderRadius={1} border="1px solid #e0e0e0">
          <Typography variant="subtitle2" gutterBottom>
            Resumen del Ciclo:
          </Typography>
          <Typography variant="body2">
            • Fases RED: {tddCycleData.filter(d => d.phase === 'RED').length}
          </Typography>
          <Typography variant="body2">
            • Fases GREEN: {tddCycleData.filter(d => d.phase === 'GREEN').length}
          </Typography>
          <Typography variant="body2">
            • Fases REFACTOR: {tddCycleData.filter(d => d.phase === 'REFACTOR').length}
          </Typography>
        </Box>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="commit-details-dialog"
      fullWidth
      maxWidth="lg"
      sx={{
        "& .MuiDialog-paper": {
          padding: "25px",
          borderRadius: "10px",
          minHeight: "500px",
        },
      }}
    >
      <DialogTitle
        id="commit-details-dialog"
        style={{ textAlign: "center", fontSize: "2em", fontWeight: "bold" }}
      >
        {`Ciclo TDD - Commit ${
          commits.length - commits.findIndex((commit) => commit.sha === selectedCommit?.sha)
        }`}
      </DialogTitle>
      
      <DialogContent>
        {selectedCommit?.sha && (
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "1.1em",
                marginBottom: "10px",
                color: "#666",
              }}
            >
              {selectedCommit.sha.substring(0, 8)}
            </div>
            {selectedCommit?.commit?.message && (
              <div style={{ marginBottom: "10px" }}>
                <strong>Mensaje:</strong>{" "}
                <span style={{ fontStyle: "italic" }}>
                  {selectedCommit.commit.message}
                </span>
              </div>
            )}
            {selectedCommit?.commit?.author?.date && (
              <div style={{ fontSize: "0.9em", color: "#888" }}>
                {formatDate(selectedCommit.commit.author.date)}
              </div>
            )}
          </div>
        )}
        
        {renderContent()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCloseModal} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TDDCommitTimelineDialog;