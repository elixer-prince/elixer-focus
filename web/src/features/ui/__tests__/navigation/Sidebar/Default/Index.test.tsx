import Sidebar from "@/features/ui/navigation/Sidebar/Default/Index";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

describe("Default Sidebar", () => {
  const links = [
    { path: "/", label: "Home" },
    { path: "/tasks", label: "Tasks" },
    // { path: "/journal", label: "Journal" },
    // {"path": "/profile", "label": "Profile"},
  ];

  it("should render a sidebar element", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    const sidebar = screen.getByRole("navigation");

    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass("sidebar");
  });

  it("should display the correct links", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    );

    links.forEach(({ label, path }) => {
      const linkElement = screen.getByRole("link", { name: label });
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute("href", path);
    });
  });
});
