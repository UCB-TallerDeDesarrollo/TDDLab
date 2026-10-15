import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import TDDCharts from '../../src/presentation/tdd-visualization/components/TDDChart';
import type { TDDLogEntry } from '../../src/modules/TDDCycles-Visualization/domain/TDDLogInterfaces';
import {
  mixedTDDLogs,
  ventasISCommitOnlyLogs,
} from '../presentation/tdd-visualization/fixtures/tddLogFixtures';
import {
  MockGithubAPI,
  convertToCommitDataObject,
} from '../presentation/tdd-visualization/__mocks__/MocksCommitHistory';
import { mockCommitDataArray } from '../presentation/tdd-visualization/__mocks__/dataTypeMocks/commitData';

// Página de QA independiente: no modifica la ruta protegida /graph ni la sesión.
// Reutiliza muestras locales y el renderizado real de Chart.js (sin mocks de dibujo).
const scenarios: Record<string, { label: string; logs: TDDLogEntry[] | null }> = {
  commits: { label: 'Solo commits (muestra reducida de ventasIS)', logs: ventasISCommitOnlyLogs },
  empty: { label: 'Log vacío', logs: [] },
  missing: { label: 'Log no disponible', logs: null },
  executions: { label: 'Con ejecuciones exitosas y fallidas', logs: mixedTDDLogs },
};
const port = new MockGithubAPI();
const commits = mockCommitDataArray.map(convertToCommitDataObject);

function ManualTDDValidation() {
  const [scenario, setScenario] = useState('commits');
  const [metric, setMetric] = useState<string | null>(null);

  return (
    <MemoryRouter>
      <main style={{ fontFamily: 'Arial, sans-serif', padding: 24 }}>
        <h1>Validación local — Segmento 3</h1>
        <p>
          Muestras de prueba locales, no resultados actuales de un repositorio.
          Esta página no valida autenticación ni carga de datos desde GitHub o staging.
        </p>
        <label htmlFor="qa-scenario">Escenario de prueba: </label>
        <select id="qa-scenario" value={scenario} onChange={event => setScenario(event.target.value)}>
          {Object.entries(scenarios).map(([value, item]) => (
            <option key={value} value={value}>{item.label}</option>
          ))}
        </select>
        <p>Revisar Dashboard, Ciclo de ejecución de pruebas y métricas por commit.</p>
        <TDDCharts
          commits={commits}
          tddLogs={scenarios[scenario].logs}
          metric={metric}
          setMetric={setMetric}
          port={port}
          role="student"
          commitsTddCycles={[]}
        />
      </main>
    </MemoryRouter>
  );
}

createRoot(document.getElementById('root')!).render(<ManualTDDValidation />);
