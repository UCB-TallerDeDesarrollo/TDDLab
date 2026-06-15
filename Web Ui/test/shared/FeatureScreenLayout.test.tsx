import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FeatureScreenLayout from "../../src/shared/components/FeatureScreenLayout";

describe("FeatureScreenLayout", () => {
  it("renders children inside a main element", () => {
    render(
      <FeatureScreenLayout>
        <p>Content</p>
      </FeatureScreenLayout>
    );

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies className when provided", () => {
    render(
      <FeatureScreenLayout className="my-layout" testId="layout-section">
        <span>Child</span>
      </FeatureScreenLayout>
    );

    expect(screen.getByTestId("layout-section")).toHaveClass("my-layout");
  });

  it("renders without className when not provided", () => {
    render(
      <FeatureScreenLayout>
        <span>Child</span>
      </FeatureScreenLayout>
    );

    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});

