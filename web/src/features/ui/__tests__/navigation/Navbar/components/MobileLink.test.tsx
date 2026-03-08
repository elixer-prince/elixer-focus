import MobileLink from "@/features/ui/navigation/Navbar/components/MobileLink";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import userEvent from "@testing-library/user-event";

const CurrentPath = () => {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
};

// Tests

describe("Mobile Link", () => {
  it("should render a link element", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <MobileLink to="/pathname">Path Name</MobileLink>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("should navigate to the specified path when clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <MobileLink to="/pathname">Path Name</MobileLink>
        <Routes>
          <Route path="*" element={<CurrentPath />} />
        </Routes>
      </MemoryRouter>,
    );

    const loginLink = screen.getByRole("link");
    await userEvent.click(loginLink);

    const currentPath = screen.getByTestId("current-path");
    expect(currentPath.textContent).toBe("/pathname");
  });
});
