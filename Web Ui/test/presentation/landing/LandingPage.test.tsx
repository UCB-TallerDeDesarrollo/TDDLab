import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../../../src/presentation/landing/pages/LandingPage";

describe("LandingPage", () => {
  it("renders the public landing message and authentication CTA", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /todo para crear software/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ir a tdd lab/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /comienza ahora/i })).toBeInTheDocument();
  });

  it("uses every required svg and png asset from landing", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const requiredImagePaths = [
      "/landing/logo.svg",
      "/landing/linea.svg",
      "/landing/intro-lineasZ.svg",
      "/landing/intro.svg",
      "/landing/intro-tddlab-center.svg",
      "/landing/circuitos-lateral-izquierdo.svg",
      "/landing/circuitos-lateral-derecho.svg",
      "/landing/beneficios-1.png",
      "/landing/beneficios-2.png",
      "/landing/beneficios-3.png",
    ];

    requiredImagePaths.forEach((imagePath) => {
      expect(document.querySelector(`img[src="${imagePath}"]`)).not.toBeNull();
    });
  });
});

