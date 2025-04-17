import React from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Button } from '@mui/material';

const AIAssistantPage = () => {
  const location = useLocation();
  const repositoryLink = location.state?.repositoryLink || "No hay enlace disponible";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', paddingTop: '20px', padding: '0 20px' }}>
      {/* Título principal */}
      <Typography
        variant="h5"
        component="div"
        style={{ fontSize: "30px", lineHeight: "3.8", textAlign: 'center', marginBottom: '20px' }}
      >
        Asistente IA
      </Typography>

      {/* Subtítulo con el enlace */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Typography
          variant="body2"
          color="text.secondary"
          style={{ fontSize: "16px", lineHeight: "1.8" }}
        >
          <strong style={{ marginRight: '8px' }}>Enlace:</strong>
          <a
            href={repositoryLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            {repositoryLink}
          </a>
        </Typography>
      </div>

      {/* Recuadro con scroll para análisis */}
      <div
        style={{
          border: '2px solid #b0b0b0',  
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',  
          width: '100%',
          maxWidth: '1200px',
          height: '400px',
          overflowY: 'scroll',  
          overflowX: 'hidden',  
          padding: '10px',
          marginBottom: '20px',
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          style={{ fontSize: "16px", lineHeight: "1.8" }}
        >
          AQUI DEBE IR LA RESPUESTA DE LA IA - PROMPT ANALIZAR
        </Typography>
      </div>

      {/* Botón ANALIZAR */}
      <Button
        variant="contained"
        color="primary"
        style={{
          textTransform: 'none',
          fontSize: '15px', 
          marginRight: '8px',  
          marginBottom: '20px',
        }}
        onClick={() => {
          console.log("Análisis iniciado");
        }}
      >
        Analizar
      </Button>

      {/* Recuadro con scroll para refactorización */}
      <div
        style={{
          border: '2px solid #b0b0b0',  
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',  
          width: '100%',
          maxWidth: '1200px',
          height: '400px',
          overflowY: 'scroll',  
          overflowX: 'hidden',  
          padding: '10px',
          marginBottom: '20px',
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          style={{ fontSize: "16px", lineHeight: "1.8" }}
        >
          AQUI DEBE IR LA RESPUESTA DE LA IA - PROMPT REFACTORIZAR
        </Typography>
      </div>

      {/* Botón REFACTORIZAR */}
      <Button
        variant="contained"
        color="primary"
        style={{
          textTransform: 'none',
          fontSize: '15px',  
          marginRight: '8px',  
        }}
        onClick={() => {
          console.log("Refactorización iniciada");
        }}
      >
        Refactorizar
      </Button>
    </div>
  );
};

export default AIAssistantPage;