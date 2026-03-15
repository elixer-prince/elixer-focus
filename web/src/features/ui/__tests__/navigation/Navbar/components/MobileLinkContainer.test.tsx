import MobileLinkContainer from "@/features/ui/navigation/Navbar/components/MobileLinkContainer";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

const MobileLinkContainerMock = () => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <MobileLinkContainer />
    </MemoryRouter>
  );
};

beforeEach(() => {});

describe("Mobile Link Container", () => {
  const links = [
    { name: /home/i, href: "/" },
    { name: /tasks/i, href: "/tasks" },
  ];

  it("should render a ul element", () => {
    render(<MobileLinkContainerMock />);

    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("should display the correct links", () => {
    render(<MobileLinkContainerMock />);

    links.forEach(({ name, href }) => {
      const linkElement = screen.getByRole("link", { name });

      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute("href", href);
    });
  });
});
