import MusicProvider from "@/app/providers/Music";
import PlayButton from "@/features/music-player/components/PlayButton";
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

const mockSetMusicPaused = vi.fn();
const mockPlayerInstance = {
  loadVideoById: vi.fn(),
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  cueVideoById: vi.fn(),
  stopVideo: vi.fn(),
  mute: vi.fn(),
  unMute: vi.fn(),
  isMuted: vi.fn(() => false),
  setVolume: vi.fn(),
  getVolume: vi.fn(() => 50),
  getPlayerState: vi.fn(() => 2),
};

vi.mock("@/features/music-player/stores/store", () => ({
  useSetMusicPaused: () => mockSetMusicPaused,
  useChosenSongId: () => 1,
  useSongs: () => [
    {
      id: 1,
      title: "Calming White Noise",
      src: "https://www.youtube.com/watch?v=yLOM8R6lbzg",
      isRecommended: true,
    },
  ],
}));

vi.mock("@/features/music-player/hooks/useMusicPlayerContext", () => ({
  default: () => ({
    playerInstanceRef: { current: mockPlayerInstance },
    playerRef: { current: null },
    isControllingPlayerRef: { current: false },
  }),
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

    expect(mockSetMusicPaused).toHaveBeenCalledWith(false);
    // loadVideoById is called directly in the click handler (within the user
    // gesture) so the browser allows autoplay.
    expect(mockPlayerInstance.loadVideoById).toHaveBeenCalledWith({
      videoId: "yLOM8R6lbzg",
      startSeconds: 0,
    });
  });
});
