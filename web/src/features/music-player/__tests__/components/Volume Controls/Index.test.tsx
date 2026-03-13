import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  showVolumeSlider: false,
  volume: 40,
  setVolume: vi.fn(),
  setVolumeOnPlayer: vi.fn(),
  setShowVolumeSlider: vi.fn(),
}));

vi.mock("@/features/music-player/stores/store", () => ({
  useShowVolumeSlider: () => mocks.showVolumeSlider,
  useVolume: () => mocks.volume,
  useSetVolume: () => mocks.setVolume,
  useSetShowVolumeSlider: () => mocks.setShowVolumeSlider,
}));

vi.mock("@/features/music-player/hooks/useMusicPlayerContext", () => ({
  default: () => ({
    playerInstanceRef: {
      current: {
        setVolume: mocks.setVolumeOnPlayer,
      },
    },
  }),
}));

import VolumeControls from "@/features/music-player/components/Volume Controls/Index";

describe("Volume Controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.showVolumeSlider = false;
    mocks.volume = 40;
  });

  it("should render the volume controls region", () => {
    render(<VolumeControls />);

    expect(
      screen.getByRole("region", { name: /volume controls/i }),
    ).toBeInTheDocument();
  });

  it("should always render the toggle button", () => {
    render(<VolumeControls />);

    expect(
      screen.getByRole("button", { name: /toggle volume controls/i }),
    ).toBeInTheDocument();
  });

  it("should show the volume slider when enabled", () => {
    mocks.showVolumeSlider = true;

    render(<VolumeControls />);

    expect(screen.getByRole("slider", { name: /volume slider/i })).toBeVisible();
  });

  it("should hide the volume slider when disabled", () => {
    mocks.showVolumeSlider = false;

    render(<VolumeControls />);

    expect(
      screen.queryByRole("slider", { name: /volume slider/i }),
    ).not.toBeInTheDocument();
  });

  it("should update store volume and player volume on change", async () => {
    mocks.showVolumeSlider = true;
    mocks.volume = 20;
    const user = userEvent.setup();

    render(<VolumeControls />);

    const slider = screen.getByRole("slider", { name: /volume slider/i });
    expect(slider).toHaveValue("20");

    await user.click(slider);
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setValue?.call(slider, "75");
    slider.dispatchEvent(new Event("input", { bubbles: true }));
    slider.dispatchEvent(new Event("change", { bubbles: true }));

    expect(mocks.setVolume).toHaveBeenLastCalledWith(75);
    expect(mocks.setVolumeOnPlayer).toHaveBeenLastCalledWith(75);
  });
});
