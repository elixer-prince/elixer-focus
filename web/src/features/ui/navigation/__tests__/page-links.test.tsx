import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Sidebar from "@/features/ui/navigation/Sidebar/Default/components/Index";
import HamburgerMenu from "@/features/ui/navigation/Navbar/components/HamburgerMenu";
import MobileLinkContainer from "@/features/ui/navigation/Navbar/components/MobileLinkContainer";
import { defaultLinks } from "@/features/ui/navigation/Sidebar/Default/constants/links";
import { useNavbarStore } from "@/features/ui/navigation/Navbar/stores/navbar-store";

const expectedLinks = [
  ["Home", "/"],
  ["Journal", "/my/journal"],
  ["Brain dump", "/my/brain-dump"],
  ["Calendar", "/my/calendar"],
  ["Tasks", "/my/tasks"],
  ["Profile", "/my/profile"],
];

const renderedLinks = () =>
  screen
    .getAllByRole("link")
    .map((link) => [link.textContent?.trim(), link.getAttribute("href")]);

describe("default page navigation", () => {
  it("defines the required destinations in one ordered list", () => {
    expect(defaultLinks.map(({ label, to }) => [label, to])).toEqual(
      expectedLinks,
    );
  });

  it("uses the same ordered destinations on desktop and mobile", async () => {
    const desktop = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );
    expect(renderedLinks()).toEqual(expectedLinks);
    desktop.unmount();

    useNavbarStore.getState().closeNavbar();
    render(
      <MemoryRouter>
        <>
          <HamburgerMenu />
          <MobileLinkContainer />
        </>
      </MemoryRouter>,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Toggle navigation menu" }),
    );
    expect(renderedLinks()).toEqual(expectedLinks);
    expect(screen.getByRole("link", { name: "Brain dump" })).toHaveAttribute(
      "href",
      "/my/brain-dump",
    );
  });
});
