import MusicProvider from "@/app/providers/Music";
import VolumeControls from "@/features/music-player/components/Volume Controls/Index";
import { useShowVolumeSlider } from "@/features/music-player/stores/store";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mock } from "vitest";

// Mocks

const VolumeControlsMock = () => {
  return (
    <MusicProvider>
      <VolumeControls />
    </MusicProvider>
  );
};

const setShowVolumeSliderMock = vi.fn();

vi.mock(
  import("@/features/music-player/stores/store"),
  async (importOriginal) => {
    const original = await importOriginal();
    return {
      ...original,
      useShowVolumeSlider: vi.fn(),
      useSetShowVolumeSlider: () => setShowVolumeSliderMock,
    };
  },
);

// Tests

describe("Volume Controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render a section element", () => {
    render(<VolumeControlsMock />);

    const sectionElement = screen.getByRole("region", {
      name: /volume controls/i,
    });

    expect(sectionElement).toBeInTheDocument();
  });

  it("should render a volume toggle button", () => {
    render(<VolumeControlsMock />);

    const volumeToggle = screen.getByRole("button", {
      name: /toggle volume controls/i,
    });
    expect(volumeToggle).toBeInTheDocument();
  });

  it("should call the useSetShowVolumeSlider hook when the toggle button is clicked", async () => {
    (useShowVolumeSlider as Mock).mockReturnValue(false);

    render(<VolumeControlsMock />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle volume controls/i,
    });
    await userEvent.click(toggleButton);

    expect(setShowVolumeSliderMock).toHaveBeenCalled();
  });

  it("should show a volume slider when showVolumeSlider is true", () => {
    (useShowVolumeSlider as Mock).mockReturnValue(true);

    render(<VolumeControlsMock />);

    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("should not show a volume slider when showVolumeSlider is false", () => {
    (useShowVolumeSlider as Mock).mockReturnValue(false);

    render(<VolumeControlsMock />);

    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  });
});
