import HamburgerMenu from "@/features/ui/navigation/Navbar/components/HamburgerMenu";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { mockToggleNavbar, mockNavbarIsOpen } = vi.hoisted(() => ({
  mockToggleNavbar: vi.fn(),
  mockNavbarIsOpen: { value: false },
}));

vi.mock("@/features/ui/navigation/Navbar/stores/navbar-store", () => ({
  useNavbarIsOpen: () => mockNavbarIsOpen.value,
  useToggleNavbar: () => mockToggleNavbar,
}));

describe("HamburgerMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavbarIsOpen.value = false;
  });

  it("should render as a button that controls the mobile navigation", () => {
    render(<HamburgerMenu />);

    const button = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });

    expect(button).toHaveClass("hamburger-menu");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "mobile-navigation");
  });

  it("should expose the expanded state when the navbar is open", () => {
    mockNavbarIsOpen.value = true;
    render(<HamburgerMenu />);

    expect(
      screen.getByRole("button", { name: /toggle navigation menu/i }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("should toggle the navbar when clicked", async () => {
    render(<HamburgerMenu />);

    const button = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });
    await userEvent.click(button);
    expect(mockToggleNavbar).toHaveBeenCalled();
  });
});
