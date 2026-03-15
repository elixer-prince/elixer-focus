import MusicProvider from "@/app/providers/Music";
import MusicPlayer from "@/features/music-player/components/Index";
import { useMusicPaused } from "@/features/music-player/stores/store";
import { render, screen } from "@testing-library/react";
import type { Mock } from "vitest";

const MusicPlayerMock = () => {
  return (
    <MusicProvider>
      <MusicPlayer />
    </MusicProvider>
  );
};

// Mocks

vi.mock(
  import("@/features/music-player/stores/store"),
  async (importOriginal) => {
    const original = await importOriginal();
    return {
      ...original,
      useMusicPaused: vi.fn(),
    };
  },
);

beforeEach(() => {
  vi.clearAllMocks();
});

// Tests

describe("Music Player", () => {
  it("should render the music player component", () => {
    render(<MusicPlayerMock />);

    expect(
      screen.getByRole("article", { name: /music player/i }),
    ).toBeInTheDocument();
  });

  it("should not render the play button when not paused", () => {
    (useMusicPaused as Mock).mockReturnValue(false);

    render(<MusicPlayerMock />);

    const playButton = screen.queryByRole("button", {
      name: /play music button/i,
    });
    expect(playButton).not.toBeInTheDocument();
  });

  it("should render the play button when paused", () => {
    (useMusicPaused as Mock).mockReturnValue(true);

    render(<MusicPlayerMock />);

    const playButton = screen.getByRole("button", {
      name: /play music button/i,
    });
    expect(playButton).toBeInTheDocument();
  });

  it("should not render the pause button when paused", () => {
    (useMusicPaused as Mock).mockReturnValue(true);

    render(<MusicPlayerMock />);

    const pauseButton = screen.queryByRole("button", {
      name: /pause music button/i,
    });
    expect(pauseButton).not.toBeInTheDocument();
  });

  it("should render the pause button when playing", () => {
    (useMusicPaused as Mock).mockReturnValue(false);

    render(<MusicPlayerMock />);

    const pauseButton = screen.getByRole("button", {
      name: /pause music button/i,
    });
    expect(pauseButton).toBeInTheDocument();
  });

  it("should render the music switcher component", () => {
    render(<MusicPlayerMock />);

    const musicSwitcher = screen.getByRole("button", {
      name: /switch song/i,
    });
    expect(musicSwitcher).toBeInTheDocument();
  });
});
