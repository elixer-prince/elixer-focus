import LoginLink from "@/features/ui/navigation/Navbar/components/LoginLink";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import userEvent from "@testing-library/user-event";

const CurrentPath = () => {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
};

// Tests

describe("Login Link", () => {
  it("should render a link element", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LoginLink />
      </MemoryRouter>,
    );

    const loginLink = screen.getByRole("link", {
      name: /login/i,
    });

    expect(loginLink).toBeInTheDocument();
  });

  it("should navigate to the login page when clicked", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LoginLink />
        <Routes>
          <Route path="*" element={<CurrentPath />} />
        </Routes>
      </MemoryRouter>,
    );

    const loginLink = screen.getByRole("link", {
      name: /login/i,
    });
    await userEvent.click(loginLink);

    const currentPath = screen.getByTestId("current-path");
    expect(currentPath.textContent).toBe("/auth/login");
  });
});
