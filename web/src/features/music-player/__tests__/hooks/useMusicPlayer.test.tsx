import type { YTPlayer } from "@/features/music-player/types/player";
import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  chosenSongId: 1,
  musicPaused: true,
  volume: 55,
  setMusicPaused: vi.fn(),
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
  useMusicPlayerStore: {
    getState: () => ({
      musicPaused: mocks.musicPaused,
      setMusicPaused: mocks.setMusicPaused,
    }),
  },
}));

vi.mock("@/features/music-player/utils/conversion", () => ({
  getVideoId: mocks.getVideoId,
}));

import MusicPlayerContext from "@/features/music-player/contexts/Context";
import type { MusicPlayerContextType } from "@/features/music-player/types/context";
import useMusicPlayer from "@/features/music-player/hooks/useMusicPlayer";

// Mutable context values that tests can update
const mockPlayerInstanceRef: { current: YTPlayer | null } = { current: null };
const mockPlayerRef: { current: HTMLDivElement | null } = { current: null };
const mockIsControllingPlayerRef = { current: false };
const mockLastLoadedVideoIdRef = { current: null };

function ContextWrapper({ children }: { children: React.ReactNode }) {
  const contextValue: MusicPlayerContextType = {
    playerInstanceRef: mockPlayerInstanceRef,
    playerRef: mockPlayerRef,
    isControllingPlayerRef: mockIsControllingPlayerRef,
    lastLoadedVideoIdRef: mockLastLoadedVideoIdRef,
  };
  return (
    <MusicPlayerContext.Provider value={contextValue}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

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
    mocks.musicPaused = true;
    mocks.volume = 55;
    mocks.setMusicPaused = vi.fn();
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
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    const script = Array.from(document.body.querySelectorAll("script")).find(
      (element) => element.src.includes("https://www.youtube.com/iframe_api"),
    );

    expect(script).toBeTruthy();
  });

  it("should load the selected song and pause when music is paused", () => {
    mocks.musicPaused = true;
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    expect(mocks.getVideoId).toHaveBeenCalledWith(
      "https://www.youtube.com/watch?v=alpha",
    );
    expect(playerInstanceRef.current.cueVideoById).toHaveBeenCalledWith({
      videoId: "id:https://www.youtube.com/watch?v=alpha",
      startSeconds: 0,
    });
    expect(playerInstanceRef.current.pauseVideo).toHaveBeenCalled();
    expect(playerInstanceRef.current.loadVideoById).not.toHaveBeenCalled();
  });

  it("should not call loadVideoById in effect when music is playing", () => {
    // When music is playing, the Option component calls loadVideoById in the
    // click handler to preserve the browser user gesture context. The effect
    // does not call any loading method when music is playing.
    mocks.musicPaused = false;
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    expect(playerInstanceRef.current.loadVideoById).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.cueVideoById).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.pauseVideo).not.toHaveBeenCalled();
  });

  it("should pause when the paused state changes to true", () => {
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    const { rerender } = renderHook(() => useMusicPlayer(), {
      wrapper: ContextWrapper,
    });

    // Initially paused, so pauseVideo should be called by the effect
    expect(playerInstanceRef.current.pauseVideo).toHaveBeenCalled();

    // Clear calls
    (
      playerInstanceRef.current.pauseVideo as ReturnType<typeof vi.fn>
    ).mockClear();

    // Unpause - the effect does not call playVideo; PlayButton handles play
    // directly in the click handler with loadVideoById (within the user
    // gesture). Calling playVideo() from this effect would be outside the
    // gesture and blocked by the browser's autoplay policy.
    mocks.musicPaused = false;

    act(() => {
      rerender();
    });

    expect(playerInstanceRef.current.playVideo).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.pauseVideo).not.toHaveBeenCalled();

    // Re-pause - the effect calls pauseVideo
    mocks.musicPaused = true;

    act(() => {
      rerender();
    });

    expect(playerInstanceRef.current.pauseVideo).toHaveBeenCalled();
  });

  it("should not reload the song when toggling play/pause", () => {
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    const { rerender } = renderHook(() => useMusicPlayer(), {
      wrapper: ContextWrapper,
    });

    // Clear calls after initial render
    (
      playerInstanceRef.current.cueVideoById as ReturnType<typeof vi.fn>
    ).mockClear();
    (
      playerInstanceRef.current.loadVideoById as ReturnType<typeof vi.fn>
    ).mockClear();
    (
      playerInstanceRef.current.pauseVideo as ReturnType<typeof vi.fn>
    ).mockClear();

    // Toggle play - the effect does not call playVideo; PlayButton handles
    // play directly in the click handler with loadVideoById (within the user
    // gesture).
    mocks.musicPaused = false;
    act(() => {
      rerender();
    });

    // Neither cue nor load nor play should be called by the effect
    expect(playerInstanceRef.current.cueVideoById).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.loadVideoById).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.playVideo).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.pauseVideo).not.toHaveBeenCalled();

    // Toggle pause - the effect calls pauseVideo
    mocks.musicPaused = true;
    act(() => {
      rerender();
    });

    expect(playerInstanceRef.current.cueVideoById).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.loadVideoById).not.toHaveBeenCalled();
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

    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    expect(globalThis.onYouTubeIframeAPIReady).toBeTypeOf("function");

    act(() => {
      globalThis.onYouTubeIframeAPIReady?.();
    });

    expect(playerConstructor).toHaveBeenCalledWith(playerRef.current, {
      playerVars: {
        autoplay: 0,
        playsinline: 1,
      },
      events: {
        onReady: expect.any(Function),
        onStateChange: expect.any(Function),
        onVolumeChange: expect.any(Function),
      },
    });

    const onReady = playerConstructor.mock.calls[0][1].events
      .onReady as () => void;
    onReady();

    expect(ytPlayerInstance.setVolume).toHaveBeenCalledWith(80);
    expect(mockPlayerInstanceRef.current).toBe(ytPlayerInstance);
  });

  it("should not call play/pause on ready since the effect handles it", () => {
    mocks.musicPaused = false;
    mocks.volume = 50;
    const playerInstanceRef = {
      current: null as YTPlayer | null,
    };
    const playerRef = createPlayerRef();
    const ytPlayerInstance = {
      cueVideoById: vi.fn(),
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      stopVideo: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      isMuted: vi.fn(() => false),
      setVolume: vi.fn(),
      getVolume: vi.fn(() => 50),
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

    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    act(() => {
      globalThis.onYouTubeIframeAPIReady?.();
    });

    const onReady = playerConstructor.mock.calls[0][1].events
      .onReady as () => void;
    onReady();

    // onReady only sets the initial volume here since playOnReadyRef is not
    // set (playback is started by PlayButton's gesture-based loadVideoById
    // once the player is ready).
    expect(ytPlayerInstance.setVolume).toHaveBeenCalledWith(50);
    expect(ytPlayerInstance.playVideo).not.toHaveBeenCalled();
    expect(ytPlayerInstance.pauseVideo).not.toHaveBeenCalled();
  });

  it("should not set player volume on store volume changes", () => {
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    const { rerender } = renderHook(() => useMusicPlayer(), {
      wrapper: ContextWrapper,
    });

    // Clear calls after initial render
    (
      playerInstanceRef.current.setVolume as ReturnType<typeof vi.fn>
    ).mockClear();

    mocks.volume = 75;

    act(() => {
      rerender();
    });

    // The hook no longer sets player volume on store changes; the slider
    // component handles that directly to avoid feedback loops
    expect(playerInstanceRef.current.setVolume).not.toHaveBeenCalled();
  });

  it("should log error when song is not found", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.chosenSongId = 999;
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    expect(consoleSpy).toHaveBeenCalledWith("Song with id 999 not found");
    consoleSpy.mockRestore();
  });

  it("should update the store when the player is stopped externally", () => {
    mocks.musicPaused = false;

    const playerInstanceRef = {
      current: null as YTPlayer | null,
    };
    const playerRef = createPlayerRef();
    const ytPlayerInstance = {
      cueVideoById: vi.fn(),
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      stopVideo: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      isMuted: vi.fn(() => false),
      setVolume: vi.fn(),
      getVolume: vi.fn(() => 50),
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

    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    act(() => {
      globalThis.onYouTubeIframeAPIReady?.();
    });

    // Trigger onReady first
    const onReady = playerConstructor.mock.calls[0][1].events
      .onReady as () => void;
    onReady();

    // Simulate the player being stopped externally (state 0 = ENDED)
    const onStateChange = playerConstructor.mock.calls[0][1].events
      .onStateChange as (event: { data: number }) => void;

    act(() => {
      onStateChange({ data: 0 }); // ENDED state
    });

    // The store's setMusicPaused should be called with true since the player
    // is no longer playing and the store said it was playing
    expect(mocks.setMusicPaused).toHaveBeenCalledWith(true);
  });

  it("should not update the store when state change matches current state", () => {
    mocks.musicPaused = true;

    const playerInstanceRef = {
      current: null as YTPlayer | null,
    };
    const playerRef = createPlayerRef();
    const ytPlayerInstance = {
      cueVideoById: vi.fn(),
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      stopVideo: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      isMuted: vi.fn(() => false),
      setVolume: vi.fn(),
      getVolume: vi.fn(() => 50),
      getPlayerState: vi.fn(() => 2),
    } as unknown as YTPlayer;
    const playerConstructor = vi.fn().mockImplementation(function Player(
      this: unknown,
    ) {
      return ytPlayerInstance;
    });

    (globalThis as { YT?: { Player: unknown } }).YT = {
      Player: playerConstructor,
    };

    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    act(() => {
      globalThis.onYouTubeIframeAPIReady?.();
    });

    const onReady = playerConstructor.mock.calls[0][1].events
      .onReady as () => void;
    onReady();

    const onStateChange = playerConstructor.mock.calls[0][1].events
      .onStateChange as (event: { data: number }) => void;

    // Player reports PAUSED (2), store already says paused -> no change needed
    act(() => {
      onStateChange({ data: 2 }); // PAUSED state
    });

    expect(mocks.setMusicPaused).not.toHaveBeenCalled();
  });

  // Regression tests for the play button flicker fix.
  // The bug: YouTube fires a sequence of transient states (UNSTARTED, BUFFERING)
  // during play/pause transitions. If the guard resets too early, a transient
  // state slips through, sees isPlaying=false with currentPaused=false, and
  // incorrectly sets the store back to paused -- causing the button to flicker.
  //
  // Strategy: use a pre-populated player so the unified effect runs on mount
  // and sets the guard. The onStateChange callback from the player constructor
  // is captured, then we verify that after the effect runs (guard active),
  // transient states are ignored and only stable states reset the guard.
  // We also test that without the guard (player created after mount), external
  // state changes are properly detected.

  it("should not update store during effect run when song changes while playing", () => {
    // When music is playing, the Option component calls loadVideoById in the
    // click handler, so the effect does not call any loading method. The guard
    // is still set, but no player method is called by the effect.
    mocks.musicPaused = false;
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    // The effect runs but does not call loadVideoById (Option component does it)
    expect(playerInstanceRef.current.loadVideoById).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.cueVideoById).not.toHaveBeenCalled();

    // The store should not be updated
    expect(mocks.setMusicPaused).not.toHaveBeenCalled();
  });

  it("should not update store during effect run when pausing", () => {
    mocks.musicPaused = true;
    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    expect(playerInstanceRef.current.pauseVideo).toHaveBeenCalled();
    expect(mocks.setMusicPaused).not.toHaveBeenCalled();
  });

  it("should detect external state change when guard is not active", () => {
    // When the guard is not active (player created after mount, effect never
    // ran with a non-null player), external state changes should be detected.
    // This is the existing behavior verified by "should update the store when
    // the player is stopped externally".
    mocks.musicPaused = false;

    const playerInstanceRef = {
      current: null as YTPlayer | null,
    };
    const playerRef = createPlayerRef();
    const ytPlayerInstance = {
      cueVideoById: vi.fn(),
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      stopVideo: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      isMuted: vi.fn(() => false),
      setVolume: vi.fn(),
      getVolume: vi.fn(() => 50),
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

    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    act(() => {
      globalThis.onYouTubeIframeAPIReady?.();
    });

    const onReady = playerConstructor.mock.calls[0][1].events
      .onReady as () => void;
    onReady();

    const onStateChange = playerConstructor.mock.calls[0][1].events
      .onStateChange as (event: { data: number }) => void;

    // Without the guard, an ENDED state should update the store
    act(() => {
      onStateChange({ data: 0 }); // ENDED
    });

    expect(mocks.setMusicPaused).toHaveBeenCalledWith(true);
  });

  it("should detect external pause when guard is not active", () => {
    mocks.musicPaused = false;

    const playerInstanceRef = {
      current: null as YTPlayer | null,
    };
    const playerRef = createPlayerRef();
    const ytPlayerInstance = {
      cueVideoById: vi.fn(),
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      stopVideo: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      isMuted: vi.fn(() => false),
      setVolume: vi.fn(),
      getVolume: vi.fn(() => 50),
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

    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    act(() => {
      globalThis.onYouTubeIframeAPIReady?.();
    });

    const onReady = playerConstructor.mock.calls[0][1].events
      .onReady as () => void;
    onReady();

    const onStateChange = playerConstructor.mock.calls[0][1].events
      .onStateChange as (event: { data: number }) => void;

    // Without the guard, a PAUSED state when store says playing should update
    act(() => {
      onStateChange({ data: 2 }); // PAUSED
    });

    expect(mocks.setMusicPaused).toHaveBeenCalledWith(true);
  });

  it("should not update store when external state matches current state", () => {
    // Without the guard, if the player state matches the store state, no update.
    mocks.musicPaused = true;

    const playerInstanceRef = {
      current: null as YTPlayer | null,
    };
    const playerRef = createPlayerRef();
    const ytPlayerInstance = {
      cueVideoById: vi.fn(),
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      stopVideo: vi.fn(),
      mute: vi.fn(),
      unMute: vi.fn(),
      isMuted: vi.fn(() => false),
      setVolume: vi.fn(),
      getVolume: vi.fn(() => 50),
      getPlayerState: vi.fn(() => 2),
    } as unknown as YTPlayer;
    const playerConstructor = vi.fn().mockImplementation(function Player(
      this: unknown,
    ) {
      return ytPlayerInstance;
    });

    (globalThis as { YT?: { Player: unknown } }).YT = {
      Player: playerConstructor,
    };

    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    act(() => {
      globalThis.onYouTubeIframeAPIReady?.();
    });

    const onReady = playerConstructor.mock.calls[0][1].events
      .onReady as () => void;
    onReady();

    const onStateChange = playerConstructor.mock.calls[0][1].events
      .onStateChange as (event: { data: number }) => void;

    // PAUSED state, store already says paused -> no update
    act(() => {
      onStateChange({ data: 2 });
    });

    expect(mocks.setMusicPaused).not.toHaveBeenCalled();
  });

  // Regression test: switching songs while playing should start the new song
  // playing. The Option component calls loadVideoById in the click handler, so
  // the effect does not call any loading method when music is playing.
  it("should not call loadVideoById in effect when switching while music is playing", () => {
    // Start with song 1 playing
    mocks.chosenSongId = 1;
    mocks.musicPaused = false;

    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    const { rerender } = renderHook(() => useMusicPlayer(), {
      wrapper: ContextWrapper,
    });

    // Initial render: effect should not call loadVideoById (Option component does it)
    expect(playerInstanceRef.current.loadVideoById).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.cueVideoById).not.toHaveBeenCalled();

    // Clear calls
    (
      playerInstanceRef.current.loadVideoById as ReturnType<typeof vi.fn>
    ).mockClear();
    (
      playerInstanceRef.current.cueVideoById as ReturnType<typeof vi.fn>
    ).mockClear();
    (
      playerInstanceRef.current.pauseVideo as ReturnType<typeof vi.fn>
    ).mockClear();

    // Switch to song 2 while still playing (musicPaused is still false)
    mocks.chosenSongId = 2;
    act(() => {
      rerender();
    });

    // The effect should not call loadVideoById (Option component handles it)
    expect(playerInstanceRef.current.loadVideoById).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.cueVideoById).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.pauseVideo).not.toHaveBeenCalled();
  });

  it("should play the new song when CUED state arrives after switching while playing", () => {
    // Start with song 1 playing
    mocks.chosenSongId = 1;
    mocks.musicPaused = false;

    const playerInstanceRef = {
      current: null as YTPlayer | null,
    };
    const playerRef = createPlayerRef();
    const ytPlayerInstance = {
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
    } as unknown as YTPlayer;
    const playerConstructor = vi.fn().mockImplementation(function Player(
      this: unknown,
    ) {
      return ytPlayerInstance;
    });

    (globalThis as { YT?: { Player: unknown } }).YT = {
      Player: playerConstructor,
    };

    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    const { rerender } = renderHook(() => useMusicPlayer(), {
      wrapper: ContextWrapper,
    });

    act(() => {
      globalThis.onYouTubeIframeAPIReady?.();
    });

    const onReady = playerConstructor.mock.calls[0][1].events
      .onReady as () => void;
    onReady();

    const onStateChange = playerConstructor.mock.calls[0][1].events
      .onStateChange as (event: { data: number }) => void;

    // Switch to song 2 while playing - the effect sets shouldPlayAfterCueRef
    mocks.chosenSongId = 2;
    act(() => {
      rerender();
    });

    // Now the CUED state arrives from the YouTube player
    act(() => {
      onStateChange({ data: 5 }); // CUED state
    });

    // playVideo should be called when CUED state arrives
    expect(ytPlayerInstance.playVideo).toHaveBeenCalled();
  });

  it("should pause the new song when switching while music is paused", () => {
    // Start with song 1 paused
    mocks.chosenSongId = 1;
    mocks.musicPaused = true;

    const playerInstanceRef = createPlayerInstanceRef();
    const playerRef = createPlayerRef();
    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = false;

    const { rerender } = renderHook(() => useMusicPlayer(), {
      wrapper: ContextWrapper,
    });

    // Clear calls after initial render
    (
      playerInstanceRef.current.cueVideoById as ReturnType<typeof vi.fn>
    ).mockClear();
    (
      playerInstanceRef.current.loadVideoById as ReturnType<typeof vi.fn>
    ).mockClear();
    (
      playerInstanceRef.current.playVideo as ReturnType<typeof vi.fn>
    ).mockClear();
    (
      playerInstanceRef.current.pauseVideo as ReturnType<typeof vi.fn>
    ).mockClear();

    // Switch to song 2 while paused
    mocks.chosenSongId = 2;
    act(() => {
      rerender();
    });

    // The new song should cue and pause
    expect(playerInstanceRef.current.cueVideoById).toHaveBeenCalledWith({
      videoId: "id:https://www.youtube.com/watch?v=beta",
      startSeconds: 0,
    });
    expect(playerInstanceRef.current.pauseVideo).toHaveBeenCalled();
    expect(playerInstanceRef.current.loadVideoById).not.toHaveBeenCalled();
    expect(playerInstanceRef.current.playVideo).not.toHaveBeenCalled();
  });

  // Regression test for the play button flicker.
  // YouTube fires transient states (UNSTARTED, CUED, PAUSED) while loadVideoById()
  // is loading. If the guard resets on PAUSED too early, a later transient state
  // slips through and incorrectly sets the store back to paused -- flickering the
  // button. The guard should only reset on PLAYING/ENDED.
  it("should not flip the store to paused on transient states during play", () => {
    mocks.musicPaused = false; // music should be playing

    const playerInstanceRef = {
      current: null as YTPlayer | null,
    };
    const playerRef = createPlayerRef();
    const ytPlayerInstance = createPlayerInstanceRef().current;
    const playerConstructor = vi.fn().mockImplementation(function Player() {
      return ytPlayerInstance;
    });

    (globalThis as { YT?: { Player: unknown } }).YT = {
      Player: playerConstructor,
    };

    mockPlayerInstanceRef.current = playerInstanceRef.current;
    mockPlayerRef.current = playerRef.current;
    mockIsControllingPlayerRef.current = true; // PlayButton is controlling

    renderHook(() => useMusicPlayer(), { wrapper: ContextWrapper });

    act(() => {
      globalThis.onYouTubeIframeAPIReady?.();
    });

    // Simulate the transient state sequence YouTube fires during loadVideoById().
    // PAUSED(2) here is transient (video still loading), NOT the final state.
    const onStateChange = playerConstructor.mock.calls[0][1].events
      .onStateChange as (event: { data: number }) => void;

    act(() => {
      onStateChange({ data: -1 }); // UNSTARTED
    });
    act(() => {
      onStateChange({ data: 5 }); // CUED
    });
    act(() => {
      onStateChange({ data: 2 }); // PAUSED (transient during load)
    });
    act(() => {
      onStateChange({ data: 3 }); // BUFFERING
    });

    // None of these transient states should flip the store back to paused.
    expect(mocks.setMusicPaused).not.toHaveBeenCalledWith(true);

    // Once PLAYING arrives, the guard resets and the store stays correct.
    act(() => {
      onStateChange({ data: 1 }); // PLAYING
    });
    expect(mocks.setMusicPaused).not.toHaveBeenCalledWith(true);
  });
});
