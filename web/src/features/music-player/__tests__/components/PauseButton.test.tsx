import MusicProvider from "@/app/providers/Music";
import PauseButton from "@/features/music-player/components/PauseButton";
import { pauseVideo } from "@/features/music-player/utils/playback";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mocks

beforeEach(() => {
  vi.clearAllMocks();
});

const MockPauseButton = () => {
  return (
    <MusicProvider>
      <PauseButton />
    </MusicProvider>
  );
};

vi.mock("@/features/music-player/utils/playback", () => ({
  pauseVideo: vi.fn(),
}));

const mockSetMusicPaused = vi.fn();

vi.mock("@/features/music-player/stores/store", () => ({
  useSetMusicPaused: () => mockSetMusicPaused,
}));

// Tests

describe("pauseButton", () => {
  it("should render a button", () => {
    render(<MockPauseButton />);

    const pauseButton = screen.getByRole("button", {
      name: /pause music button/i,
    });

    expect(pauseButton).toBeInTheDocument();
  });

  it("should render a pause icon", () => {
    render(<MockPauseButton />);

    const pauseIcon = screen.getByRole("img", { name: /pause music button/i });
    expect(pauseIcon).toBeInTheDocument();
  });

  it("should pause the song when clicked", async () => {
    render(<MockPauseButton />);

    const pauseButton = screen.getByRole("button", {
      name: /pause music button/i,
    });
    await userEvent.click(pauseButton);

    expect(pauseVideo).toHaveBeenCalled();
    expect(mockSetMusicPaused).toHaveBeenCalledWith(true);
  });
});
