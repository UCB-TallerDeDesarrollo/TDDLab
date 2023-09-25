import { render, waitFor } from "@testing-library/react";
import CycleReportView from "../../../../../src/TDD-Visualization/application/views/CycleReportView/components/CycleReportView";
import { mockCommitData } from "../../../../__ mocks __/dataTypeMocks/commitData";

class MockTDDCyclesPort {
  obtainCommitsOfRepo = jest.fn(async () => {
    return [mockCommitData];
  });
  obtainJobsData = jest.fn(async () => {
    return {};
  });
}
describe("CycleReport View tests", () => {
  test("checks if Port is being used", async () => {
    const mockPort = new MockTDDCyclesPort();

    render(<CycleReportView port={mockPort} />);

    await waitFor(() => {
      expect(mockPort.obtainJobsData).toHaveBeenCalled();
      expect(mockPort.obtainCommitsOfRepo).toHaveBeenCalled();
    });
  });
});
