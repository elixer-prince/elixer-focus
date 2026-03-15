import type { YTPlayer } from "@/features/music-player/types/player";
import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  chosenSongId: 1,
  musicPaused: false,
  volume: 55,
  songs: [
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
  ],
  getVideoId: vi.fn((src: string) => `id:${src}`),
}));

vi.mock("@/features/music-player/stores/store", () => ({
  useChosenSongId: () => mocks.chosenSongId,
  useMusicPaused: () => mocks.musicPaused,
  useVolume: () => mocks.volume,
  useSongs: () => mocks.songs,
}));

vi.mock("@/features/music-player/utils/conversion", () => ({
  getVideoId: mocks.getVideoId,
}));

import useMusicPlayer from "@/features/music-player/hooks/useMusicPlayer";

describe("useMusicPlayer", () => {
  const createPlayerInstanceRef = () => ({
    current: {
      loadVideoById: vi.fn(),
      cueVideoById: vi.fn(),
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      stopVideo: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      isMuted: vi.fn(() => false),
      setVolume: vi.fn(),
      getVolume: vi.fn(() => 55),
      getPlayerState: vi.fn(() => 1),
    } as unknown as YTPlayer,
  });

  const createPlayerRef = () => ({
    current: document.createElement("div"),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.chosenSongId = 1;
    mocks.musicPaused = false;
    mocks.volume = 55;
    mocks.songs = [
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
    ];
    delete (globalThis as { onYouTubeIframeAPIReady?: () => void })
      .onYouTubeIframeAPIReady;
    delete (globalThis as { YT?: { Player: unknown } }).YT;
  });

  it("should inject the YouTube iframe API script", () => {
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();

    renderHook(() => useMusicPlayer({ playerInstanceRef, playerRef }));

    const script = Array.from(document.body.querySelectorAll("script")).find(
      (element) => element.src.includes("https://www.youtube.com/iframe_api"),
    );

    expect(script).toBeTruthy();
  });

  it("should load the selected song and respect the paused state", () => {
    mocks.musicPaused = true;
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();

    renderHook(() => useMusicPlayer({ playerInstanceRef, playerRef }));

    expect(mocks.getVideoId).toHaveBeenCalledWith(
      "https://www.youtube.com/watch?v=alpha",
    );
    expect(playerInstanceRef.current.loadVideoById).toHaveBeenCalledWith({
      videoId: "id:https://www.youtube.com/watch?v=alpha",
      startSeconds: 0,
    });
    expect(playerInstanceRef.current.pauseVideo).toHaveBeenCalled();
  });

  it("should play or pause when the paused state changes", () => {
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();

    const { rerender } = renderHook(() =>
      useMusicPlayer({ playerInstanceRef, playerRef }),
    );

    expect(playerInstanceRef.current.playVideo).toHaveBeenCalled();

    mocks.musicPaused = true;

    act(() => {
      rerender();
    });

    expect(playerInstanceRef.current.pauseVideo).toHaveBeenCalled();
  });

  it("should create a YouTube player on API ready and set volume", () => {
    mocks.musicPaused = true;
    mocks.volume = 80;
    const playerInstanceRef = {
      current: null as YTPlayer | null,
    };
    const playerRef = createPlayerRef();
    const ytPlayerInstance = {
      loadVideoById: vi.fn(),
      cueVideoById: vi.fn(),
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      stopVideo: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      isMuted: vi.fn(() => false),
      setVolume: vi.fn(),
      getVolume: vi.fn(() => 80),
      getPlayerState: vi.fn(() => 1),
    } as unknown as YTPlayer;
    const playerConstructor = vi.fn().mockImplementation(function Player(
      this: unknown,
    ) {
      return ytPlayerInstance;
    });

    (globalThis as { YT?: { Player: unknown } }).YT = {
      Player: playerConstructor,
    };

    renderHook(() => useMusicPlayer({ playerInstanceRef, playerRef }));

    expect(globalThis.onYouTubeIframeAPIReady).toBeTypeOf("function");

    act(() => {
      globalThis.onYouTubeIframeAPIReady?.();
    });

    expect(playerConstructor).toHaveBeenCalledWith(playerRef.current, {
      videoId: "id:https://www.youtube.com/watch?v=alpha",
      playerVars: {
        autoplay: 0,
        playsinline: 1,
      },
      events: {
        onReady: expect.any(Function),
      },
    });

    const onReady = playerConstructor.mock.calls[0][1].events
      .onReady as () => void;
    onReady();

    expect(ytPlayerInstance.setVolume).toHaveBeenCalledWith(80);
    expect(playerInstanceRef.current).toBe(ytPlayerInstance);
  });

  it("should handle volume changes during playback", () => {
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();

    const { rerender } = renderHook(() =>
      useMusicPlayer({ playerInstanceRef, playerRef }),
    );

    // Volume is set on initial render with the current volume
    expect(playerInstanceRef.current.setVolume).toHaveBeenCalledWith(55);

    mocks.volume = 75;

    act(() => {
      rerender();
    });

    expect(playerInstanceRef.current.setVolume).toHaveBeenCalledWith(75);
  });

  it("should log error when song is not found", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.chosenSongId = 999;
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();

    renderHook(() => useMusicPlayer({ playerInstanceRef, playerRef }));

    expect(consoleSpy).toHaveBeenCalledWith("Song with id 999 not found");
    consoleSpy.mockRestore();
  });
});
