import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FeedbackSnackbar from "../../src/shared/components/FeedbackSnackbar";

describe("FeedbackSnackbar", () => {
  it("renders the message when open is true", () => {
    render(
      <FeedbackSnackbar
        open={true}
        message="Something went wrong"
        onClose={() => {}}
      />
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("applies the default severity of error", () => {
    render(
      <FeedbackSnackbar
        open={true}
        message="Error message"
        onClose={() => {}}
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("applies a custom severity when provided", () => {
    render(
      <FeedbackSnackbar
        open={true}
        message="Success!"
        severity="success"
        onClose={() => {}}
      />
    );

    expect(screen.getByText("Success!")).toBeInTheDocument();
  });

  it("calls onClose when the alert close button is clicked", () => {
    const onClose = jest.fn();
    render(
      <FeedbackSnackbar
        open={true}
        message="Close me"
        onClose={onClose}
      />
    );

    const closeButtons = screen.getAllByRole("button");
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });
});

