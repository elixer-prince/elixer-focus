import ToggleButton from "@/features/music-player/components/Volume Controls/ToggleButton";
import { useShowVolumeSlider } from "@/features/music-player/stores/store";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Mock } from "vitest";

// Mocks

const mockSetShowVolumeSlider = vi.fn();

vi.mock("@/features/music-player/stores/store", () => ({
  useShowVolumeSlider: vi.fn(),
  useSetShowVolumeSlider: () => mockSetShowVolumeSlider,
}));

// Tests

describe("Volume Toggle Button", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render a volume toggle button", () => {
    render(<ToggleButton />);

    const volumeToggle = screen.getByRole("button", {
      name: /toggle volume controls/i,
    });
    expect(volumeToggle).toBeInTheDocument();
  });

  it("should render a volume toggle icon", () => {
    render(<ToggleButton />);

    const volumeToggleIcon = screen.getByRole("img", {
      name: /toggle volume controls/i,
    });
    expect(volumeToggleIcon).toBeInTheDocument();
  });

  it("should should show the volume slider when clicked if hidden", async () => {
    (useShowVolumeSlider as Mock).mockReturnValue(false);

    render(<ToggleButton />);

    const volumeToggle = screen.getByRole("button", {
      name: /toggle volume controls/i,
    });
    await userEvent.click(volumeToggle);

    expect(mockSetShowVolumeSlider).toHaveBeenCalledWith(true);
  });

  it("should should hide the volume slider when clicked if visible", async () => {
    (useShowVolumeSlider as Mock).mockReturnValue(true);

    render(<ToggleButton />);

    const volumeToggle = screen.getByRole("button", {
      name: /toggle volume controls/i,
    });
    await userEvent.click(volumeToggle);

    expect(mockSetShowVolumeSlider).toHaveBeenCalledWith(false);
  });
});
