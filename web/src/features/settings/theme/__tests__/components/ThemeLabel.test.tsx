import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeLabel from "@/features/settings/theme/components/ThemeLabel";
import { vi } from "vitest";

vi.mock("@/stores/theme", () => ({
  useCurrentTheme: () => "dark",
  useSetCurrentTheme: () => vi.fn(),
}));

vi.mock("@/features/settings/theme/components/ThemePreview", () => ({
  default: ({ theme, selected }: { theme: string; selected?: boolean }) => (
    <div data-testid={`theme-preview-${theme}`} data-selected={selected}>
      Preview: {theme}
    </div>
  ),
}));

describe("ThemeLabel", () => {
  it("should render the theme name and preview", () => {
    render(<ThemeLabel value={"dark"}>Dark</ThemeLabel>);

    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByTestId("theme-preview-dark")).toBeInTheDocument();
  });

  it("should mark the current theme as selected", () => {
    render(<ThemeLabel value={"dark"}>Dark</ThemeLabel>);

    const preview = screen.getByTestId("theme-preview-dark");
    expect(preview.getAttribute("data-selected")).toBe("true");
  });

  it("should not mark a non-current theme as selected", () => {
    render(<ThemeLabel value={"light"}>Light</ThemeLabel>);

    const preview = screen.getByTestId("theme-preview-light");
    expect(preview.getAttribute("data-selected")).toBe("false");
  });

  it("should call onThemeChange when theme is selected", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(
      <ThemeLabel value={"light"} onThemeChange={onThemeChange}>
        Light
      </ThemeLabel>,
    );

    const radio = screen.getByRole("radio");
    await user.click(radio);

    expect(onThemeChange).toHaveBeenCalledWith("light");
  });

  it("should not call onThemeChange when it is not provided", async () => {
    const user = userEvent.setup();
    render(<ThemeLabel value={"light"}>Light</ThemeLabel>);

    const radio = screen.getByRole("radio");
    await user.click(radio);

    expect(() => {}).not.toThrow();
  });

  it("should apply primary text color to the selected theme label", () => {
    render(<ThemeLabel value={"dark"}>Dark</ThemeLabel>);

    const label = screen.getByText("Dark");
    expect(label).toHaveClass("text-primary");
  });
});
