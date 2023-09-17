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
    fireEvent.click(verCommitButton);
    const open = jest.fn()
    Object.defineProperty(window, 'open', open);
  });
});