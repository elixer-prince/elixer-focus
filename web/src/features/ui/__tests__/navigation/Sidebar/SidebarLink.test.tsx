import SidebarLink from "@/features/ui/navigation/Sidebar/Link";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

const CurrentPath = () => {
  const location = useLocation();
  return <span data-testid="current-path">{location.pathname}</span>;
};

describe("Sidebar Link", () => {
  it("should render a link element", () => {
    render(
      <MemoryRouter>
        <SidebarLink to="/" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("should navigate to the specified path when clicked", async () => {
    render(
      <MemoryRouter>
        <SidebarLink to="/pathname">Path Name</SidebarLink>
        <Routes>
          <Route path="*" element={<CurrentPath />} />
        </Routes>
      </MemoryRouter>,
    );

    const currentPath = screen.getByTestId("current-path");

    const linkElement = screen.getByRole("link");
    await userEvent.click(linkElement);

    expect(currentPath.textContent).toBe("/pathname");
  });
});
