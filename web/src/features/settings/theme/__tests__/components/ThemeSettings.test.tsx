import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeSettings from "@/features/settings/theme/components/Index";
import { vi } from "vitest";

vi.mock("@/stores/theme", () => ({
  useCurrentTheme: () => "dark",
  useSetCurrentTheme: () => vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
  },
}));

describe("ThemeSettings", () => {
  it("should render the page title and description", () => {
    render(<ThemeSettings />);

    expect(
      screen.getByRole("heading", { name: "Theme Settings" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Pick a visual theme for the app/),
    ).toBeInTheDocument();
  });

  it("should render the search input", () => {
    render(<ThemeSettings />);

    const searchInput = screen.getByPlaceholderText("Search themes...");
    expect(searchInput).toBeInTheDocument();
  });

  it("should filter themes when searching", async () => {
    const user = userEvent.setup();
    render(<ThemeSettings />);

    const searchInput = screen.getByPlaceholderText("Search themes...");
    await user.type(searchInput, "dark");

    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.queryByText("Light")).not.toBeInTheDocument();
  });

  it("should show no results message when search matches nothing", async () => {
    const user = userEvent.setup();
    render(<ThemeSettings />);

    const searchInput = screen.getByPlaceholderText("Search themes...");
    await user.type(searchInput, "zzzznotfound");

    expect(
      screen.getByText("No themes match your search."),
    ).toBeInTheDocument();
  });

  it("should render all themes when search is empty", () => {
    render(<ThemeSettings />);

    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Cupcake")).toBeInTheDocument();
    expect(screen.getByText("Dracula")).toBeInTheDocument();
  });
});
