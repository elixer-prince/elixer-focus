import Navbar from "@/features/ui/navigation/Navbar/components/Index";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

// Mocks

const NavbarMock = () => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <Navbar />
    </MemoryRouter>
  );
};

// Tests

describe("Navbar", () => {
  it("should render a navigation element", () => {
    render(<NavbarMock />);

    expect(document.querySelector("nav")).toBeInTheDocument();
  });

  it("should render the nav logo", () => {
    render(<NavbarMock />);

    expect(screen.getByLabelText(/elixer focus logo/i)).toBeInTheDocument();
  });

  it("should render the current time", () => {
    render(<NavbarMock />);

    expect(
      screen.getByRole("article", { name: /current time/i }),
    ).toBeInTheDocument();
  });

  it("should render the hamburger menu", () => {
    render(<NavbarMock />);

    expect(
      screen.getByLabelText(/toggle navigation menu/i),
    ).toBeInTheDocument();
  });
});
