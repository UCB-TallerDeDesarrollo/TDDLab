import { render, fireEvent } from '@testing-library/react';
import TDDCycleCard from '../../../src/sections/TDDCycles-Visualization/TDDCycleCard';
import { mockCommitInfoData } from './__mocks__/dataTypeMocks/commitData';
import { mockSuccessJobData,mockFailedJobData } from './__mocks__/dataTypeMocks/jobData';
import '@testing-library/jest-dom';


describe('CycleCard component', () => {
    
  it('renders the commit message', () => {
    const { getByText } = render(<TDDCycleCard commit={mockCommitInfoData} jobs={null}/>);
    const commitMessageElement = getByText('Commit Mock commit message');
    
    expect(commitMessageElement).toBeInTheDocument();
  });

  it('renders the commit stats', () => {
    const { getByText } = render(<TDDCycleCard commit={mockCommitInfoData} jobs={mockSuccessJobData} />);
    const statsMessageElement = getByText('Total: 5 Adiciones: 4 Sustraccion: 1');
    expect(statsMessageElement).toBeInTheDocument();
});


  it('renders the card as success', () => {
    const { getByText } = render(<TDDCycleCard commit={mockCommitInfoData} jobs={mockSuccessJobData}/>);
    const commitMessageElement = getByText('Actions:success');
    
    expect(commitMessageElement).toBeInTheDocument();
  });

  it('renders the card as failed', () => {
    const { getByText } = render(<TDDCycleCard commit={mockCommitInfoData} jobs={mockFailedJobData}/>);
    const commitMessageElement = getByText('Actions:failure');
    expect(commitMessageElement).toBeInTheDocument();
  });

  it('renders the card with no actions', () => {
    const { getByText } = render(<TDDCycleCard commit={mockCommitInfoData} jobs={null}/>);
    const commitMessageElement = getByText('Actions werent Found');
    expect(commitMessageElement).toBeInTheDocument();
  });

  it('redirects to the GitHub commit page when the "Ver commit" button is clicked', () => {
    const { getByText } = render(<TDDCycleCard commit={mockCommitInfoData} jobs={mockSuccessJobData} />);
    const verCommitButton = getByText('Ver commit');
    expect(verCommitButton).toBeInTheDocument();
    
    const mockWindowOpen = jest.fn();
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true,
    });
  
    fireEvent.click(verCommitButton);

    setTimeout(() => {
      expect(setTimeout).toHaveBeenCalledWith(expect.any(expect(mockWindowOpen).toHaveBeenCalledWith(mockCommitInfoData.html_url, 'mockHtmlUrl')), 3000);
      expect(mockWindowOpen).toHaveBeenCalled();
    }, 3000);
  });
});