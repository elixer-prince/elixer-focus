import { render, screen } from "@testing-library/react";
import ThemePreview from "@/features/settings/theme/components/ThemePreview";

describe("ThemePreview", () => {
  it("should render a preview with the given theme", () => {
    render(<ThemePreview theme={"dark"} />);

    const preview = screen.getByTestId("theme-preview-dark");
    expect(preview).toHaveAttribute("data-theme", "dark");
  });

  it("should show the selected ring when selected is true", () => {
    render(<ThemePreview theme={"dark"} selected />);

    const preview = screen.getByTestId("theme-preview-dark");
    expect(preview.className).toContain("ring-2");
    expect(preview.className).toContain("ring-primary/30");
  });

  it("should not show the selected ring when not selected", () => {
    render(<ThemePreview theme={"dark"} />);

    const preview = screen.getByTestId("theme-preview-dark");
    expect(preview.className).not.toContain("ring-2");
  });

  it("should show the check mark when selected", () => {
    render(<ThemePreview theme={"dark"} selected />);

    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("should not show the check mark when not selected", () => {
    render(<ThemePreview theme={"dark"} />);

    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  it("should display theme colors (primary, secondary, accent, neutral)", () => {
    render(<ThemePreview theme={"dark"} />);

    const preview = screen.getByTestId("theme-preview-dark");
    expect(preview.innerHTML).toContain("bg-primary");
    expect(preview.innerHTML).toContain("bg-secondary");
    expect(preview.innerHTML).toContain("bg-accent");
    expect(preview.innerHTML).toContain("bg-neutral");
  });

  it("should apply theme transition classes", () => {
    render(<ThemePreview theme={"dark"} />);

    const preview = screen.getByTestId("theme-preview-dark");
    expect(preview.className).toContain("transition-all");
    expect(preview.className).toContain("duration-500");
  });
});
