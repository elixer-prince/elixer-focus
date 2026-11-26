import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Sidebar from "@/features/ui/navigation/Sidebar/Default/components/Index";
import MobileLinkContainer from "@/features/ui/navigation/Navbar/components/MobileLinkContainer";
import { defaultLinks } from "@/features/ui/navigation/Sidebar/Default/constants/links";

const expectedLinks = [
  ["Home", "/"],
  ["Journal", "/journal"],
  ["Brain dump", "/my/brain-dump"],
  ["Calendar", "/calendar"],
  ["Tasks", "/tasks"],
  ["Profile", "/profile"],
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

  it("uses the same ordered destinations on desktop and mobile", () => {
    const desktop = render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );
    expect(renderedLinks()).toEqual(expectedLinks);
    desktop.unmount();

    render(
      <MemoryRouter>
        <MobileLinkContainer />
      </MemoryRouter>,
    );
    expect(renderedLinks()).toEqual(expectedLinks);
    expect(screen.getByRole("link", { name: "Brain dump" })).toHaveAttribute(
      "href",
      "/my/brain-dump",
    );
  });
});
