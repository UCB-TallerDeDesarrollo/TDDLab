import { mockArrayCommitData } from './__mocks__/dataTypeMocks/commitData';
import { mockArrayJobData } from './__mocks__/dataTypeMocks/jobData';
import { render, screen, waitFor } from '@testing-library/react';
import TDDCharts from '../../../src/sections/TDDCycles-Visualization/components/TDDChart';
import "@testing-library/jest-dom";


// Datos de muestra para el gráfico
/*const sampleData = {
  labels: ['A', 'B', 'C'],
  datasets: [
    {
      label: 'Sample Data',
      data: [1, 2, 3],
    },
  ],
};

describe('ChartComponent', () => {
    it('renders a Chart.js chart with the provided data', () => {
      render(<ChartComponent data={sampleData} />);

  
      waitFor(() => {
        const chartContainer = screen.getByTestId('chart-container');
        const chart = chartContainer.querySelector('.chartjs-render-monitor');
        expect(chartContainer).toBeInTheDocument();

        expect(chart).toBeInTheDocument();
        expect(chart).toHaveTextContent('Sample Data');
        expect(chart).toHaveTextContent('A');
        expect(chart).toHaveTextContent('B');
        expect(chart).toHaveTextContent('C');
        expect(chart).toHaveTextContent('1');
        expect(chart).toHaveTextContent('2');
        expect(chart).toHaveTextContent('3');
      });
    });
  });*/


describe('TDDChart', () => {
  it('renders a Chart.js chart with the provided data', () => {
    render(<TDDCharts commits={mockArrayCommitData} jobsByCommit={mockArrayJobData} ></TDDCharts>) 

    waitFor(() => {
      const chartContainer = screen.getByTestId('lineChartContainer');
      expect(chartContainer).toBeInTheDocument();
    });
  });
});