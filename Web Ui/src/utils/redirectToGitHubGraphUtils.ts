import { createSearchParams, NavigateFunction } from "react-router-dom";

export const redirectToGitHubGraph = (
  link: string | undefined,
  navigate: NavigateFunction
) => {
  if (link) {
    const regex = /https:\/\/github\.com\/([^/]+)\/([^/]+)/;
    const match = regex.exec(link);

    if (match) {
      const [, user, repo] = match;
      console.log(user, repo);
      navigate({
        pathname: "/graph",
        search: createSearchParams({
          repoOwner: user,
          repoName: repo,
        }).toString(),
      });
    } else {
      alert("Invalid GitHub URL. Please enter a valid GitHub repository URL.");
    }
  } else {
    alert("No GitHub URL found for this assignment.");
  }
};
