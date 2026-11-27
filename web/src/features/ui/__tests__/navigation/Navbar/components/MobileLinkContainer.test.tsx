import MobileLinkContainer from "@/features/ui/navigation/Navbar/components/MobileLinkContainer";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";

const { mockCloseNavbar, mockNavbarIsOpen } = vi.hoisted(() => ({
  mockCloseNavbar: vi.fn(),
  mockNavbarIsOpen: { value: true },
}));

vi.mock("@/features/ui/navigation/Navbar/stores/navbar-store", () => ({
  useCloseNavbar: () => mockCloseNavbar,
  useNavbarIsOpen: () => mockNavbarIsOpen.value,
}));

const MobileLinkContainerMock = () => {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <button id="mobile-navigation-toggle" aria-controls="mobile-navigation">
        Menu
      </button>
      <MobileLinkContainer />
      <button type="button">Outside</button>
      <LocationDisplay />
    </MemoryRouter>
  );
};

const LocationDisplay = () => {
  const location = useLocation();

  return <div data-testid="location">{location.pathname}</div>;
};

describe("Mobile Link Container", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavbarIsOpen.value = true;
  });

  it("should render a partial mobile navigation drawer", () => {
    render(<MobileLinkContainerMock />);

    const drawer = screen.getByRole("navigation", {
      name: /mobile navigation/i,
    });

    expect(drawer).toHaveAttribute("id", "mobile-navigation");
    expect(drawer).toHaveClass(
      "fixed",
      "top-(--navbar-height)",
      "bottom-0",
      "z-40",
      "w-[min(18rem,68vw)]",
      "md:hidden",
    );
  });

  it("locks page scrolling and shows a dimming backdrop while open", () => {
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    const { unmount } = render(<MobileLinkContainerMock />);

    const backdrop = screen.getByRole("button", {
      name: "Close mobile navigation",
    });

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(backdrop.parentElement).toBe(document.body);
    expect(backdrop).toHaveClass(
      "fixed",
      "top-(--navbar-height)",
      "z-[35]",
      "bg-black/30",
      "md:hidden",
    );

    unmount();

    expect(document.body.style.overflow).toBe(bodyOverflow);
    expect(document.documentElement.style.overflow).toBe(rootOverflow);
  });

  it("should hide and disable the drawer when it is closed", () => {
    mockNavbarIsOpen.value = false;
    render(
      <MemoryRouter>
        <MobileLinkContainer />
      </MemoryRouter>,
    );

    const drawer = document.getElementById("mobile-navigation");

    expect(drawer).toHaveAttribute("aria-hidden", "true");
    expect(drawer).toHaveAttribute("inert");
    expect(drawer).toHaveClass("-translate-x-full", "pointer-events-none");
  });

  it("should display all desktop links in the same order", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <MobileLinkContainer />
      </MemoryRouter>,
    );

    const links = screen.getAllByRole("link");

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "Home",
      "Journal",
      "Brain dump",
      "Calendar",
      "Tasks",
      "Profile",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/journal",
      "/my/brain-dump",
      "/calendar",
      "/tasks",
      "/profile",
    ]);
    expect(links[0]).toHaveAttribute("aria-current", "page");
  });

  it("should close on Escape and return focus to the hamburger", async () => {
    render(<MobileLinkContainerMock />);

    const trigger = screen.getByRole("button", { name: "Menu" });
    screen.getByRole("link", { name: /home/i }).focus();
    await userEvent.keyboard("{Escape}");

    expect(mockCloseNavbar).toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it("should close when a pointer event happens outside the drawer", async () => {
    render(<MobileLinkContainerMock />);

    await userEvent.click(screen.getByRole("button", { name: "Outside" }));

    expect(mockCloseNavbar).toHaveBeenCalled();
  });

  it("should not close when the hamburger is clicked outside the drawer", async () => {
    render(<MobileLinkContainerMock />);

    await userEvent.click(screen.getByRole("button", { name: "Menu" }));

    expect(mockCloseNavbar).not.toHaveBeenCalled();
  });

  it("should close after a link is selected", async () => {
    render(<MobileLinkContainerMock />);

    await userEvent.click(screen.getByRole("link", { name: /calendar/i }));

    expect(mockCloseNavbar).toHaveBeenCalled();
    expect(screen.getByTestId("location")).toHaveTextContent("/calendar");
  });
});
