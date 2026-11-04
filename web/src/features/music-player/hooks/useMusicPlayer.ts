import {
  useChosenSongId,
  useMusicPaused,
  useMusicPlayerStore,
  useSongs,
  useVolume,
} from "@/features/music-player/stores/store";
import type { YTPlayer } from "@/features/music-player/types/player";
import { getVideoId } from "@/features/music-player/utils/conversion";
import { type RefObject, useCallback, useEffect, useRef } from "react";

interface MusicPlayerContextType {
  playerInstanceRef: RefObject<YTPlayer | null>;
  playerRef: RefObject<HTMLDivElement | null>;
}

// YouTube player state constants
const YT_PLAYER_STATE_PLAYING = 1;
const YT_PLAYER_STATE_BUFFERING = 3;

const useMusicPlayer = ({
  playerInstanceRef,
  playerRef,
}: MusicPlayerContextType) => {
  const chosenSongId = useChosenSongId();
  const musicPaused = useMusicPaused();
  const volume = useVolume();
  const songs = useSongs();

  // Track the last processed song and paused state so the unified effect
  // knows whether to act.
  const lastChosenSongIdRef = useRef<number | null>(null);
  const lastMusicPausedRef = useRef<boolean | null>(null);

  // Flag to distinguish our own player calls from external state changes.
  // When the unified effect calls loadVideoById/playVideo/pauseVideo, this
  // flag is true so handleStateChange ignores the resulting onStateChange
  // events and avoids a feedback loop that causes button flicker. The guard
  // stays active until the player reaches a stable state (PLAYING, PAUSED,
  // or ENDED), because YouTube fires transient states like UNSTARTED and
  // BUFFERING multiple times before settling.
  const isControllingPlayerRef = useRef(false);

  // Handle player state changes from external sources (e.g., another tab
  // stopping the video). When the player leaves PLAYING/BUFFERING state,
  // update the store so the UI reflects the change. Skip if we are the ones
  // controlling the player to avoid a feedback loop. The guard resets only
  // when the player reaches a stable state, not on every event.
  const handleStateChange = useCallback((eventData: number) => {
    if (isControllingPlayerRef.current) {
      // Reset the guard only when the player reaches a stable state.
      // Transient states like UNSTARTED (-1) and BUFFERING (3) fire multiple
      // times during play/pause transitions and should all be ignored.
      const isStable =
        eventData === YT_PLAYER_STATE_PLAYING ||
        eventData === 2 || // PAUSED
        eventData === 0; // ENDED
      if (isStable) {
        isControllingPlayerRef.current = false;
      }
      return;
    }
    const isPlaying =
      eventData === YT_PLAYER_STATE_PLAYING ||
      eventData === YT_PLAYER_STATE_BUFFERING;
    const { musicPaused: currentPaused } = useMusicPlayerStore.getState();
    // Only update if the state actually changed to avoid unnecessary re-renders
    if (!isPlaying && !currentPaused) {
      useMusicPlayerStore.getState().setMusicPaused(true);
    } else if (isPlaying && currentPaused) {
      useMusicPlayerStore.getState().setMusicPaused(false);
    }
  }, []);

  // Handle volume changes from external sources (e.g., system mute,
  // browser controls, or another tab). Sync the player volume back to the
  // store so the UI icon stays in sync.
  const handleVolumeChange = useCallback(() => {
    if (!playerInstanceRef.current) return;
    const playerVolume = playerInstanceRef.current.getVolume();
    const { volume: currentVolume } = useMusicPlayerStore.getState();
    if (playerVolume !== currentVolume) {
      useMusicPlayerStore.getState().setVolume(playerVolume);
    }
  }, [playerInstanceRef]);

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  }, []);

  // Unified effect for song switching and play/pause. Uses refs to track
  // the last processed state so it only acts when something actually changed.
  // Uses isControllingPlayerRef to prevent onStateChange from overwriting
  // the store during our own player calls, which causes button flicker.
  useEffect(() => {
    if (!playerInstanceRef.current) return;

    const player = playerInstanceRef.current;
    const songChanged = chosenSongId !== lastChosenSongIdRef.current;
    const pauseStateChanged = musicPaused !== lastMusicPausedRef.current;

    // If nothing changed, skip. On first mount both refs are null, so we
    // always act the first time the player is available.
    if (!songChanged && !pauseStateChanged) return;

    // Set the flag before any player call so onStateChange events are ignored
    isControllingPlayerRef.current = true;

    // If the song changed, load the new video first
    if (songChanged) {
      const selectedSong = songs.find((song) => song.id === chosenSongId);

      if (!selectedSong) {
        console.error(`Song with id ${chosenSongId} not found`);
        isControllingPlayerRef.current = false;
        return;
      }

      const videoId = getVideoId(selectedSong.src);
      player.loadVideoById({ videoId, startSeconds: 0 });
      lastChosenSongIdRef.current = chosenSongId;
    }

    // Play or pause if the pause state changed, or if the song changed
    // (so the new song starts in the correct state)
    if (pauseStateChanged || songChanged) {
      if (musicPaused) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      lastMusicPausedRef.current = musicPaused;
    }

    // The guard flag is reset by handleStateChange after it ignores the first
    // onStateChange event, so the guard stays active until the player actually
    // reports a state change, not based on a timer that may fire too early.
  }, [chosenSongId, musicPaused, songs, playerInstanceRef]);

  useEffect(() => {
    globalThis.onYouTubeIframeAPIReady = () => {
      // Only proceed if player div exists
      if (playerRef.current !== null) {
        // Create the player without a videoId so it does not auto-load and
        // fire onStateChange before the unified effect is ready. The unified
        // effect loads the selected song explicitly, which prevents the
        // initial mount flicker caused by race conditions between the
        // constructor's implicit load and the effect.
        playerInstanceRef.current = new globalThis.YT.Player(
          playerRef.current,
          {
            playerVars: {
              autoplay: 0,
              playsinline: 1,
            },
            events: {
              onReady: () => {
                const player = playerInstanceRef.current;
                if (!player) return;

                // Set initial volume from store
                player.setVolume(volume);

                // Play/pause and song loading are handled by the unified
                // effect, which will run when this callback returns and
                // playerInstanceRef.current is non-null.
              },
              onStateChange: (event: { data: number }) => {
                handleStateChange(event.data);
              },
              onVolumeChange: () => {
                handleVolumeChange();
              },
            },
          },
        );
      }
    };
    // handleStateChange and handleVolumeChange are stable (useCallback) and used
    // inside the closure, so they don't need to be dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerInstanceRef, playerRef, volume]);
};

export default useMusicPlayer;
