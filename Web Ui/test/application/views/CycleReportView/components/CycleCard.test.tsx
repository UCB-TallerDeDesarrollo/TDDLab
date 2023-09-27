import { render, fireEvent } from '@testing-library/react';
import CycleCard from '../../../../../src/application/views/CycleReportView/components/CycleCard';
import { mockCommitData } from '../../../../__ mocks __/dataTypeMocks/commitData';
import { mockSuccessJobData,mockFailedJobData } from '../../../../__ mocks __/dataTypeMocks/jobData';
import '@testing-library/jest-dom';


describe('CycleCard component', () => {
    
  it('renders the commit message', () => {
    const { getByText } = render(<CycleCard commit={mockCommitData} jobs={null}/>);
    const commitMessageElement = getByText('Commit Mock commit message');
    
    expect(commitMessageElement).toBeInTheDocument();
  });

  it('renders the commit stats', () => {
    const { getByText } = render(<CycleCard commit={mockCommitData} jobs={mockSuccessJobData} />);
    const statsMessageElement = getByText('Total: 5 Adiciones: 4 Sustraccion: 1');
    expect(statsMessageElement).toBeInTheDocument();
});


  it('renders the card as success', () => {
    const { getByText } = render(<CycleCard commit={mockCommitData} jobs={mockSuccessJobData}/>);
    const commitMessageElement = getByText('Actions:success');
    
    expect(commitMessageElement).toBeInTheDocument();
  });

  it('renders the card as failed', () => {
    const { getByText } = render(<CycleCard commit={mockCommitData} jobs={mockFailedJobData}/>);
    const commitMessageElement = getByText('Actions:failure');
    expect(commitMessageElement).toBeInTheDocument();
  });

  it('renders the card with no actions', () => {
    const { getByText } = render(<CycleCard commit={mockCommitData} jobs={null}/>);
    const commitMessageElement = getByText('Actions werent Found');
    expect(commitMessageElement).toBeInTheDocument();
  });

  it('redirects to the GitHub commit page when the "Ver commit" button is clicked', () => {
    const { getByText } = render(<CycleCard commit={mockCommitData} jobs={mockSuccessJobData} />);
    const verCommitButton = getByText('Ver commit');
    expect(verCommitButton).toBeInTheDocument();
    
    const mockWindowOpen = jest.fn();
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true,
    });
  
    fireEvent.click(verCommitButton);

    setTimeout(() => {
      expect(setTimeout).toHaveBeenCalledWith(expect.any(expect(mockWindowOpen).toHaveBeenCalledWith(mockCommitData.html_url, 'mockHtmlUrl')), 3000);
      expect(mockWindowOpen).toHaveBeenCalled();
    }, 3000);
  });
});