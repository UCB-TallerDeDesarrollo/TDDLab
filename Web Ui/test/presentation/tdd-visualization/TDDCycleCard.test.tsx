import { render, fireEvent, screen } from '@testing-library/react';
import TDDCycleCard from '../../../src/presentation/tdd-visualization/components/TDDCycleCard';
import { mockCommitData } from './__mocks__/dataTypeMocks/commitData';
import { convertToCommitDataObject } from './__mocks__/MocksCommitHistory'; 
import '@testing-library/jest-dom';

describe('CycleCard component', () => {
  const commitDataObject = convertToCommitDataObject(mockCommitData);

  it('renders the commit message', () => {
    const { getByText } = render(<TDDCycleCard commit={commitDataObject} />);
    const commitMessageElement = getByText('Commit Mock commit message');

    expect(commitMessageElement).toBeInTheDocument();
  });

  it('shows a commit title and a collapsible body', () => {
    render(<TDDCycleCard commit={{
      ...commitDataObject,
      commit: { ...commitDataObject.commit, message: 'Ajustar cobertura\n\nIncluye casos sin ejecuciones.' },
    }} />);

    expect(screen.getByText('Ajustar cobertura')).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: 'Mostrar mensaje del commit' });
    const body = screen.getByText('Incluye casos sin ejecuciones.');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(body).not.toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName('Ocultar mensaje del commit');
    expect(body).toBeVisible();
  });

  it('renders the commit stats', () => {
    const { getByTestId } = render(<TDDCycleCard commit={commitDataObject} />);

    const totalText = getByTestId("total");
    const additionsText = getByTestId("addition");
    const deletionsText = getByTestId("deletion");
    const coverageText = getByTestId("coverage");
    const testCount = getByTestId("test-count");

    expect(totalText).toBeInTheDocument();
    expect(additionsText).toBeInTheDocument();
    expect(deletionsText).toBeInTheDocument();
    expect(coverageText).toBeInTheDocument();
    expect(testCount).toBeInTheDocument();
  });

  it.each([
    { coverage: 0, text: '0%' },
    { coverage: null, text: 'Sin datos' },
  ])('shows coverage $coverage as $text', ({ coverage, text }) => {
    render(<TDDCycleCard commit={{ ...commitDataObject, coverage }} />);

    expect(screen.getByText('Cobertura:').parentElement).toHaveTextContent(`Cobertura: ${text}`);
  });

  it('preserves a recorded count of zero tests', () => {
    render(<TDDCycleCard commit={{ ...commitDataObject, test_count: 0, conclusion: 'neutral' }} />);

    expect(screen.getByText('Número de Tests:').parentElement).toHaveTextContent('Número de Tests: 0');
    expect(screen.getByText('Sin resultado')).toBeInTheDocument();
  });

  it.each([
    [1, 'success', 'Exitoso'],
    [1, 'failure', 'Fallido'],
    [0, 'neutral', 'Sin resultado'],
  ])('shows %i tests and %s as a passive %s status', (test_count, conclusion, label) => {
    render(<TDDCycleCard commit={{ ...commitDataObject, test_count, conclusion }} />);

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: label })).toBeNull();
    expect(screen.getByRole('link', { name: 'Ver commit' })).toBeInTheDocument();
  });

  it('redirects to the GitHub commit page when the "Ver commit" button is clicked', () => {
    const { getByText } = render(<TDDCycleCard commit={commitDataObject} />);
    const verCommitButton = getByText('Ver commit');
    expect(verCommitButton).toBeInTheDocument();

    const originalOpen = window.open;
    window.open = jest.fn();

    fireEvent.click(verCommitButton);

    setTimeout(() => {
      expect(window.open).toHaveBeenCalledWith(commitDataObject.html_url, '_blank');
      window.open = originalOpen; // Restore the original window.open
    }, 3000);
  });
});
