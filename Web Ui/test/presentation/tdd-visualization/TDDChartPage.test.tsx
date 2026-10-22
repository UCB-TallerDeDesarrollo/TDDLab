import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TDDChartPage from "../../../src/presentation/tdd-visualization/pages/TDDChartPage";
import {
	MockGithubAPI,
	MockGithubAPIEmpty,
	MockGithubAPIError,
} from "./__mocks__/MocksCommitHistory";

jest.mock("react-router-dom", () => ({
	useNavigate: jest.fn(),
	useSearchParams: jest.fn(() => {
		const params = new URLSearchParams();
		const getMock = jest.fn();

		getMock.mockReturnValueOnce("exampleOwner");
		getMock.mockReturnValueOnce("exampleRepo");

		params.get = getMock;
		return [params];
	}),
}));

describe("TDDChartPage", () => {
	test.each([["admin"], ["student"]])(
		"renders loading spinner when loading is true for role %s",
		async (role) => {
			const { getByTestId } = render(
				<TDDChartPage port={new MockGithubAPI()} role={role} teacher_id={294} graphs="graph" />
			);

			await waitFor(() => {
				const loadingSpinner = getByTestId("loading-spinner");
				expect(loadingSpinner).toBeInTheDocument();
			});
		}
	);

	test.each([["admin"], ["student"]])(
		"displays an error message when no data is available for role %s",
		async (role) => {
			const { getByTestId } = render(
				<TDDChartPage port={new MockGithubAPIEmpty()} role={role} teacher_id={294} graphs="graph" />
			);

			await waitFor(() => {
				const error = getByTestId("errorMessage");
				expect(error).toBeInTheDocument();
			});
		}
	);

	test.each([["admin"], ["student"]])(
		"displays the repository name for role %s",
		async (role) => {
			const { getByTestId } = render(
				<TDDChartPage port={new MockGithubAPI()} role={role} teacher_id={294} graphs="graph" />
			);

			await waitFor(() => {
				const repoName = getByTestId("repoNameTitle");
				expect(repoName).toBeInTheDocument();

				if (role === "admin") {
					const repoOwner = getByTestId("repoOwnerTitle");
					expect(repoOwner).toBeInTheDocument();
				}
			});
		}
	);

	it("displays the error message when the API request fails", async () => {
		const { getByTestId } = render(
			<TDDChartPage port={new MockGithubAPIError()} role="admin" teacher_id={294} graphs="graph" />
		);

		await waitFor(() => {
			const error = getByTestId("errorMessage");
			expect(error.textContent).toEqual(expect.any(String));
			expect(error.textContent?.length).toBeGreaterThan(0);
		});
	});
});