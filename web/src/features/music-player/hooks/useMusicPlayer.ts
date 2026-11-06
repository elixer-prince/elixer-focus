import {
  useChosenSongId,
  useMusicPaused,
  useMusicPlayerStore,
  useSongs,
  useVolume,
} from "@/features/music-player/stores/store";
import useMusicPlayerContext from "@/features/music-player/hooks/useMusicPlayerContext";
import { getVideoId } from "@/features/music-player/utils/conversion";
import { useCallback, useEffect, useRef } from "react";

// YouTube player state constants
const YT_PLAYER_STATE_PLAYING = 1;
const YT_PLAYER_STATE_BUFFERING = 3;
const YT_PLAYER_STATE_CUED = 5;

const useMusicPlayer = () => {
  const { playerInstanceRef, playerRef, isControllingPlayerRef, lastLoadedVideoIdRef } =
    useMusicPlayerContext();

  const chosenSongId = useChosenSongId();
  const musicPaused = useMusicPaused();
  const volume = useVolume();
  const songs = useSongs();

  // Track the last processed song and paused state so the unified effect
  // knows whether to act.
  const lastChosenSongIdRef = useRef<number | null>(null);
  const lastMusicPausedRef = useRef<boolean | null>(null);

  // Track whether the next CUED state should trigger playVideo().
  // Set to true when cueVideoById is called in a click handler and the
  // music should be playing, so handleStateChange can play once the
  // video finishes cueing.
  const shouldPlayAfterCueRef = useRef(false);

  // Track whether Play was clicked while the YouTube player instance was not
  // ready yet. When the player is created in onReady we load the song so the
  // user isn't left with a "paused" button and no sound on the first click.
  const playOnReadyRef = useRef(false);

  // Handle player state changes from external sources (e.g., another tab
  // stopping the video). When the player leaves PLAYING/BUFFERING state,
  // update the store so the UI reflects the change. Skip if we are the ones
  // controlling the player to avoid a feedback loop. The guard resets only
  // when the player reaches a stable state, not on every event.
  const handleStateChange = useCallback((eventData: number) => {
    // If a video was just cued and should play, trigger playback now.
    // This runs inside the onStateChange callback which is still part of
    // the user gesture event chain from the original click, so the browser
    // allows autoplay.
    if (shouldPlayAfterCueRef.current) {
      // While waiting for the CUED state after a song switch, ignore all
      // non-CUED states. Transient states (UNSTARTED, PAUSED, etc.) that fire
      // during cueing must not flip the store to paused, which would cause
      // the play/pause button to show the wrong state.
      if (eventData === YT_PLAYER_STATE_CUED) {
        shouldPlayAfterCueRef.current = false;
        isControllingPlayerRef.current = true;
        playerInstanceRef.current?.playVideo();
      }
      return;
    }

    if (isControllingPlayerRef.current) {
      // Only reset the guard once the player reaches the intended stable state
      // (PLAYING or ENDED). Resetting on PAUSED is too early: YouTube fires
      // PAUSED(2) as a transient state while loadVideoById() is still loading,
      // which would let a later transient state slip through and flip the store
      // back to paused -- causing the play button to flicker.
      const isStable = eventData === YT_PLAYER_STATE_PLAYING || eventData === 0; // ENDED
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
    const player = playerInstanceRef.current;
    const songChanged = chosenSongId !== lastChosenSongIdRef.current;
    const pauseStateChanged = musicPaused !== lastMusicPausedRef.current;

    // If nothing changed, skip. On first mount both refs are null, so we
    // always act the first time the player is available.
    if (!songChanged && !pauseStateChanged) return;

    // If the player isn't ready yet we can't control it, but we can still
    // record the intent. If Play was clicked (paused → not paused) while the
    // player wasn't ready, remember it so onReady loads the song once the
    // player is created (fixes the first click being lost when Play is
    // clicked before the YouTube API finishes loading).
    if (!player) {
      if (lastMusicPausedRef.current === true && !musicPaused) {
        playOnReadyRef.current = true;
      }
      lastMusicPausedRef.current = musicPaused;
      return;
    }

    // If the song changed, load the new video
    if (songChanged) {
      const selectedSong = songs.find((song) => song.id === chosenSongId);

      if (!selectedSong) {
        console.error(`Song with id ${chosenSongId} not found`);
        return;
      }

      const videoId = getVideoId(selectedSong.src);

      // When music is playing, the Option component calls cueVideoById in the
      // click handler. The effect sets shouldPlayAfterCueRef so handleStateChange
      // can call playVideo() when the CUED state arrives. If music is paused,
      // the effect cues and pauses explicitly.
      if (musicPaused) {
        isControllingPlayerRef.current = true;
        player.cueVideoById({ videoId, startSeconds: 0 });
        player.pauseVideo();
        lastLoadedVideoIdRef.current = videoId;
      } else {
        // Signal handleStateChange to play when CUED state arrives
        shouldPlayAfterCueRef.current = true;
      }
      lastChosenSongIdRef.current = chosenSongId;
      lastMusicPausedRef.current = musicPaused;
    } else if (pauseStateChanged) {
      // Only play/pause state changed, no song switch. PlayButton calls
      // loadVideoById() directly in the click handler (within the user
      // gesture) so the browser allows autoplay. Calling playVideo() from
      // this effect runs outside the gesture and is blocked by the browser's
      // autoplay policy, so we only handle pausing here.
      //
      // If we're waiting for CUED to play after a song switch, but the user
      // paused before CUED arrived, cancel the pending play so playVideo()
      // isn't called when CUED eventually fires.
      if (shouldPlayAfterCueRef.current && musicPaused) {
        shouldPlayAfterCueRef.current = false;
      }
      if (musicPaused) {
        isControllingPlayerRef.current = true;
        player.pauseVideo();
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

                // If Play was clicked while the player wasn't ready yet,
                // load the song now so playback starts and the first click
                // isn't lost. Otherwise the player is left paused to match
                // the store (playback is started by PlayButton's gesture-based
                // loadVideoById once the player is ready).
                if (playOnReadyRef.current) {
                  playOnReadyRef.current = false;
                  const selectedSong = songs.find(
                    (song) => song.id === chosenSongId,
                  );
                  if (selectedSong) {
                    const videoId = getVideoId(selectedSong.src);
                    player.loadVideoById({ videoId, startSeconds: 0 });
                    lastLoadedVideoIdRef.current = videoId;
                  }
                }
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
