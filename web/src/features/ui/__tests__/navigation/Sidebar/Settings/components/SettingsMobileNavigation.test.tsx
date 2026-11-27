import SettingsSidebar from "@/features/ui/navigation/Sidebar/Settings/components/Index";
import { useNavbarStore } from "@/features/ui/navigation/Navbar/stores/navbar-store";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router";

const LocationDisplay = () => {
  const location = useLocation();

  return <div data-testid="location">{location.pathname}</div>;
};

const SettingsMobileNavigationMock = () => (
  <MemoryRouter initialEntries={["/settings/timer"]}>
    <SettingsSidebar />
    <LocationDisplay />
    <button type="button">Outside</button>
  </MemoryRouter>
);

describe("Settings mobile navigation", () => {
  beforeEach(() => {
    useNavbarStore.setState({ navbarIsOpen: false });
  });

  it("provides a partial drawer with the settings destinations in desktop order", async () => {
    const user = userEvent.setup();
    render(<SettingsMobileNavigationMock />);

    const settingsNavigation = screen.getByRole("navigation", {
      name: "Settings navigation",
    });
    const trigger = screen.getByRole("button", {
      name: "Toggle settings navigation menu",
    });
    const logo = screen.getByRole("link", { name: "Elixer Focus logo" });
    const header = settingsNavigation.querySelector("header");
    const headerGroup = trigger.parentElement;

    expect(settingsNavigation).toHaveClass("h-(--navbar-height)");
    expect(settingsNavigation).toHaveClass("border-b");
    expect(settingsNavigation).not.toHaveClass("border-b-2");
    expect(header).toHaveClass("max-sm:h-full");
    expect(header?.firstElementChild).toBe(headerGroup);
    expect(headerGroup).toBe(logo.parentElement);
    expect(headerGroup).toHaveClass("flex", "items-center", "gap-2");
    expect(trigger).not.toHaveClass("min-h-11", "min-w-11");
    expect(
      trigger.compareDocumentPosition(logo) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(trigger).toHaveAttribute(
      "aria-controls",
      "settings-mobile-navigation",
    );
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(
      document.getElementById("settings-mobile-navigation"),
    ).toHaveAttribute("aria-hidden", "true");
    expect(
      document.getElementById("settings-mobile-navigation"),
    ).toHaveAttribute("inert");

    await user.click(trigger);

    const drawer = screen.getByRole("navigation", {
      name: "Mobile settings navigation",
    });
    expect(drawer.parentElement).toBe(document.body);
    expect(drawer).toHaveClass(
      "fixed",
      "top-(--navbar-height)",
      "bottom-0",
      "z-40",
      "w-[min(18rem,68vw)]",
      "sm:hidden",
      "motion-reduce:transition-none",
    );

    const links = within(drawer).getAllByRole("link");
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      "Calendar",
      "Timer",
      "Themes",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/settings/calendar",
      "/settings/timer",
      "/settings/themes",
    ]);
    expect(links[1]).toHaveAttribute("aria-current", "page");

    await user.click(within(drawer).getByRole("link", { name: /calendar/i }));

    expect(screen.getByTestId("location")).toHaveTextContent(
      "/settings/calendar",
    );
    expect(useNavbarStore.getState().navbarIsOpen).toBe(false);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<SettingsMobileNavigationMock />);

    const trigger = screen.getByRole("button", {
      name: "Toggle settings navigation menu",
    });
    await user.click(trigger);
    within(
      screen.getByRole("navigation", { name: "Mobile settings navigation" }),
    )
      .getByRole("link", { name: /calendar/i })
      .focus();

    await user.keyboard("{Escape}");

    expect(useNavbarStore.getState().navbarIsOpen).toBe(false);
    expect(trigger).toHaveFocus();
  });

  it("closes when a pointer action happens outside the drawer", async () => {
    const user = userEvent.setup();
    render(<SettingsMobileNavigationMock />);

    await user.click(
      screen.getByRole("button", { name: "Toggle settings navigation menu" }),
    );
    await user.click(screen.getByRole("button", { name: "Outside" }));

    expect(useNavbarStore.getState().navbarIsOpen).toBe(false);
  });

  it("locks page scrolling and closes through the dimming backdrop", async () => {
    const user = userEvent.setup();
    const bodyOverflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    render(<SettingsMobileNavigationMock />);

    await user.click(
      screen.getByRole("button", { name: "Toggle settings navigation menu" }),
    );

    const backdrop = screen.getByRole("button", {
      name: "Close mobile navigation",
    });

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(backdrop.parentElement).toBe(document.body);
    expect(backdrop).toHaveClass("z-[35]", "bg-black/30", "sm:hidden");

    await user.click(backdrop);

    expect(useNavbarStore.getState().navbarIsOpen).toBe(false);
    expect(document.body.style.overflow).toBe(bodyOverflow);
    expect(document.documentElement.style.overflow).toBe(rootOverflow);
  });
});
