import { render, fireEvent } from '@testing-library/react';
import TDDCycleCard from '../../../src/sections/TDDCycles-Visualization/components/TDDCycleCard';
import { mockCommitData } from './__mocks__/dataTypeMocks/commitData';
import { convertToCommitDataObject } from './__mocks__/MocksCommitHistory'; 
import '@testing-library/jest-dom';

describe('CycleCard component', () => {
  const commitDataObject = convertToCommitDataObject(mockCommitData);

  it('renders the commit message', () => {
    const { getByText } = render(<TDDCycleCard commit={commitDataObject} />);
    const commitMessageElement = getByText('Commit: Commit Mock commit message');

    expect(commitMessageElement).toBeInTheDocument();
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