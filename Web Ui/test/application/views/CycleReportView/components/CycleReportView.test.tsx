import {  render } from '@testing-library/react';
import CycleReportView from '../../../../../src/application/views/CycleReportView/components/CycleReportView';
import { mockCommitData } from '../../../../__ mocks __/dataTypeMocks/commitData';


class MockTDDCyclesPort {
    obtainCommitsOfRepo = jest.fn(async () => {
      return [mockCommitData];
    });
  }
describe('CycleReport View tests', () => {

  
  test('checks if Port is being used', async () => {
    const mockPort = new MockTDDCyclesPort();
    render(<CycleReportView port={mockPort} />);
    expect(mockPort.obtainCommitsOfRepo).toHaveBeenCalled();
  });
  
  
});