import HamburgerMenu from "@/features/ui/navigation/Navbar/components/HamburgerMenu";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockToggleNavbar = vi.fn();

vi.mock("@/features/ui/navigation/Navbar/stores/navbar-store", () => ({
  useToggleNavbar: () => mockToggleNavbar,
}));

describe("HamburgerMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<HamburgerMenu />);
  });

  it("should render as a button", () => {
    const button = screen.getByRole("button");

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("hamburger-menu");
  });

  it("should toggle the navbar when clicked", async () => {
    const button = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });
    await userEvent.click(button);
    expect(mockToggleNavbar).toHaveBeenCalled();
  });
});
