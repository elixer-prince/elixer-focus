import NavLogo from "@/features/ui/navigation/NavLogo";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

const CurrentPath = () => {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
};

describe("NavLogo", () => {
  it("should render a link element", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <NavLogo />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("should navigate to the home page when clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/pathname"]}>
        <NavLogo />
        <Routes>
          <Route path="*" element={<CurrentPath />} />
        </Routes>
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", {
      name: /elixer focus/i,
    });
    await userEvent.click(link);

    const currentPath = screen.getByTestId("current-path");
    expect(currentPath.textContent).toBe("/");
  });
});
