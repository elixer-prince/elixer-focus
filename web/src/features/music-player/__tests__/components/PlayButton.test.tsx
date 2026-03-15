import MusicProvider from "@/app/providers/Music";
import PlayButton from "@/features/music-player/components/PlayButton";
import { playVideo } from "@/features/music-player/utils/playback";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks

beforeEach(() => {
  vi.clearAllMocks();
});

const MockPlayButton = () => {
  return (
    <MusicProvider>
      <PlayButton />
    </MusicProvider>
  );
};

vi.mock("@/features/music-player/utils/playback", () => ({
  playVideo: vi.fn(),
}));

const mockSetMusicPaused = vi.fn();

vi.mock("@/features/music-player/stores/store", () => ({
  useSetMusicPaused: () => mockSetMusicPaused,
}));

// Tests

describe("playButton", () => {
  it("should render a button", () => {
    render(<MockPlayButton />);

    const playButton = screen.getByRole("button", {
      name: /play music button/i,
    });

    expect(playButton).toBeInTheDocument();
  });

  it("should render a play icon", () => {
    render(<MockPlayButton />);

    const playIcon = screen.getByRole("img", { name: /play music button/i });
    expect(playIcon).toBeInTheDocument();
  });

  it("should play the song when clicked", async () => {
    render(<MockPlayButton />);

    const playButton = screen.getByRole("button", {
      name: /play music button/i,
    });
    await userEvent.click(playButton);

    expect(playVideo).toHaveBeenCalled();
    expect(mockSetMusicPaused).toHaveBeenCalledWith(false);
  });
});
