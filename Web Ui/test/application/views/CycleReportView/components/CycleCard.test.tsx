import { render } from '@testing-library/react';
import CycleCard from '../../../../../src/application/views/CycleReportView/components/CycleCard';
import { mockCommitData } from '../../../../__ mocks __/dataTypeMocks/commitData';
import '@testing-library/jest-dom';


describe('CycleCard component', () => {
    
  it('renders the commit message', () => {
    const { getByText } = render(<CycleCard commit={mockCommitData} />);
    const commitMessageElement = getByText('Commit Mock commit message');
    
    expect(commitMessageElement).toBeInTheDocument();
  });
});