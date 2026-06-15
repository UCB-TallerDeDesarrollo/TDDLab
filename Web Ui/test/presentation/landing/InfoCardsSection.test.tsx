import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import InfoCardsSection from "../../../src/presentation/landing/components/InfoCardsSection";

describe("InfoCardsSection", () => {
  it("renders the three info card titles", () => {
    render(<InfoCardsSection />);

    expect(screen.getByText("¿Qué es?")).toBeInTheDocument();
    expect(screen.getByText("¿Cómo funciona?")).toBeInTheDocument();
    expect(screen.getByText("¿Para qué sirve?")).toBeInTheDocument();
  });

  it("renders the description for the first card", () => {
    render(<InfoCardsSection />);

    expect(
      screen.getByText(/extensión para Visual Studio Code/i)
    ).toBeInTheDocument();
  });

  it("renders bold keywords in the second card description", () => {
    render(<InfoCardsSection />);

    expect(screen.getByText("Rojo")).toBeInTheDocument();
    expect(screen.getByText("Verde")).toBeInTheDocument();
    expect(screen.getByText("Refactorizar")).toBeInTheDocument();
  });

  it("renders bold keyword in the third card description", () => {
    render(<InfoCardsSection />);

    expect(screen.getByText("antes")).toBeInTheDocument();
  });

  it("renders three cards", () => {
    const { container } = render(<InfoCardsSection />);

    const cards = container.querySelectorAll(".card");
    expect(cards).toHaveLength(3);
  });
});

