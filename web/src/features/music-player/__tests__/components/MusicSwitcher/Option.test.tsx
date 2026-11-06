import Option from "@/features/music-player/components/MusicSwitcher/Option";
import { useMusicPaused } from "@/features/music-player/stores/store";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks

const mockSetChosenSongId = vi.fn();

vi.mock("@/features/music-player/stores/store", () => ({
  useChosenSongId: vi.fn().mockReturnValue(2),
  useSetChosenSongId: () => mockSetChosenSongId,
  useMusicPaused: vi.fn().mockReturnValue(true),
  useSongs: vi.fn().mockReturnValue([
    {
      id: 1,
      title: "Song One",
      src: "https://www.youtube.com/watch?v=alpha",
      isRecommended: true,
    },
    {
      id: 2,
      title: "Song Two",
      src: "https://www.youtube.com/watch?v=beta",
      isRecommended: false,
    },
  ]),
}));

const mockPlayerInstance = {
  cueVideoById: vi.fn(),
  loadVideoById: vi.fn(),
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
};

vi.mock("@/features/music-player/hooks/useMusicPlayerContext", () => ({
  default: () => ({
    playerInstanceRef: { current: mockPlayerInstance },
    playerRef: { current: null },
    isControllingPlayerRef: { current: false },
    lastLoadedVideoIdRef: { current: null },
  }),
}));

// Tests

describe("Music Dropdown Option", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render as a list item", () => {
    render(<Option id={1} title="My Song Title" isRecommended={false} />);

    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });

  it("should display the song title", () => {
    render(<Option id={1} title="My Song Title" isRecommended={false} />);

    expect(screen.getByText("My Song Title")).toBeInTheDocument();
  });

  it("should have a recommended badge if the song is recommended", () => {
    render(<Option id={1} title="My Song Title" isRecommended={true} />);

    expect(screen.getByText(/recommended/i)).toBeInTheDocument();
  });

  it("should not have a recommended badge if the song is not recommended", () => {
    render(<Option id={1} title="My Song Title" isRecommended={false} />);

    expect(screen.queryByText(/recommended/i)).not.toBeInTheDocument();
  });

  it("should change the song when clicked", async () => {
    render(<Option id={1} title="My Song Title" isRecommended={false} />);

    const songLabel = screen.getByLabelText("Switch to 'My Song Title'");
    await userEvent.click(songLabel);

    expect(mockSetChosenSongId).toHaveBeenCalled();
  });

  it("should be checked if the song is the current song", () => {
    render(<Option id={2} title="My Song Title" isRecommended={false} />);

    expect(screen.getByRole("radio")).toBeChecked();
  });

  it("should cue the new video when switching songs while playing", async () => {
    vi.mocked(useMusicPaused).mockReturnValue(false);

    render(<Option id={1} title="My Song Title" isRecommended={false} />);

    const songLabel = screen.getByLabelText("Switch to 'My Song Title'");
    await userEvent.click(songLabel);

    expect(mockPlayerInstance.cueVideoById).toHaveBeenCalledWith({
      videoId: "alpha",
      startSeconds: 0,
    });
  });

  it("should not cue the video when switching songs while paused", async () => {
    vi.mocked(useMusicPaused).mockReturnValue(true);

    render(<Option id={1} title="My Song Title" isRecommended={false} />);

    const songLabel = screen.getByLabelText("Switch to 'My Song Title'");
    await userEvent.click(songLabel);

    expect(mockPlayerInstance.cueVideoById).not.toHaveBeenCalled();
  });
});
