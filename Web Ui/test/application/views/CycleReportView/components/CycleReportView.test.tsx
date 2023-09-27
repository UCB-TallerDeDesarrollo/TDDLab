import {  render,waitFor } from '@testing-library/react';
import CycleReportView from '../../../../../src/application/views/CycleReportView/components/CycleReportView';
import { mockCommitData, mockCommitInfoData } from '../../../../__ mocks __/dataTypeMocks/commitData';


class MockTDDCyclesPort {
  obtainCommitsOfRepo = jest.fn(async () => {
      return [mockCommitData];
    });
  obtainJobsData=jest.fn(async () => {
      return {};
    });
  obtainCommitInformation = jest.fn(async () => {
    return mockCommitInfoData;
  });

  }
describe('CycleReport View tests', () => {

  test('checks if Port is being used', async () => {
    const mockPort = new MockTDDCyclesPort();

    render(<CycleReportView port={mockPort} />);

    await waitFor(() => {
      expect(mockPort.obtainJobsData).toHaveBeenCalled();
      expect(mockPort.obtainCommitsOfRepo).toHaveBeenCalled();
      expect(mockPort.obtainCommitInformation).toHaveBeenCalled();
    });
    
  });
  
  
});