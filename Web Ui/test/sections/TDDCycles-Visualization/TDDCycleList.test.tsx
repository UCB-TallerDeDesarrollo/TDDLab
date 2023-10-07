import {  render,waitFor } from '@testing-library/react';
import TDDCycleList from '../../../src/sections/TDDCycles-Visualization/TDDCycleList';
import { MockGithubAPI } from './__mocks__/MocksGithubAPI';

describe('CycleReport View tests', () => {

  test('checks if Port is being used', async () => {
    const mockPort = new MockGithubAPI();

    render(<TDDCycleList port={mockPort} />);

    await waitFor(() => {
      expect(mockPort.obtainRunsOfGithubActions).toHaveBeenCalled();
      expect(mockPort.obtainCommitsOfRepo).toHaveBeenCalled();
      expect(mockPort.obtainCommitsFromSha).toHaveBeenCalled();
    });
    
  });
});