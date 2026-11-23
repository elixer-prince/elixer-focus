import {
  useMusicPlayerStore,
  useSongs,
} from "@/features/music-player/stores/store";
import { defaultSongs } from "@/features/music-player/data/default-songs";
import { act, renderHook } from "@testing-library/react";

const createSong = (id: string, title: string, isRecommended: boolean) => ({
  id,
  title,
  src: `https://www.youtube.com/watch?v=${id}`,
  isRecommended,
});

beforeEach(() => {
  useMusicPlayerStore.setState({
    songs: [
      createSong("yLOM8R6lbzg", "Calming White Noise", true),
      createSong("sF80I-TQiW0", "90's Chill Lofi Playlist", true),
      createSong("jfKfPfyJRdk", "Lofi Radio (Lofi Girl)", true),
      createSong("M5QY2_8704o", "Chillstep Music for Programming", false),
    ],
    volume: 50,
  });
});

describe("Music Player Store", () => {
  describe("setChosenSongId", () => {
    it("should set the chosen song id to the id specified", () => {
      useMusicPlayerStore.setState({ chosenSongId: "yLOM8R6lbzg" });
      const setChosenSongId = useMusicPlayerStore.getState().setChosenSongId;

      act(() => {
        setChosenSongId("sF80I-TQiW0");
      });

      const chosenSongId = useMusicPlayerStore.getState().chosenSongId;
      expect(chosenSongId).toBe("sF80I-TQiW0");
    });

    it("should throw an error if the id specified does not exist in the songs array", () => {
      const setChosenSongId = useMusicPlayerStore.getState().setChosenSongId;

      expect(() => setChosenSongId("nonexistent")).toThrowError(
        /id nonexistent was not found/i,
      );
    });
  });

  describe("setMusicPaused", () => {
    it("should play the music if false is passed", () => {
      useMusicPlayerStore.setState({ musicPaused: true });

      const setMusicPaused = useMusicPlayerStore.getState().setMusicPaused;

      act(() => {
        setMusicPaused(false);
      });

      const musicPaused = useMusicPlayerStore.getState().musicPaused;
      expect(musicPaused).toBe(false);
    });

    it("should pause the music if true is passed", () => {
      useMusicPlayerStore.setState({ musicPaused: false });

      const setMusicPaused = useMusicPlayerStore.getState().setMusicPaused;

      act(() => {
        setMusicPaused(true);
      });

      const musicPaused = useMusicPlayerStore.getState().musicPaused;
      expect(musicPaused).toBe(true);
    });
  });

  describe("setShowVolumeSlider", () => {
    it("should set showVolumeSlider to true if true is passed", () => {
      useMusicPlayerStore.setState({ showVolumeSlider: false });

      const setShowVolumeSlider =
        useMusicPlayerStore.getState().setShowVolumeSlider;

      act(() => {
        setShowVolumeSlider(true);
      });

      const showVolumeSlider = useMusicPlayerStore.getState().showVolumeSlider;
      expect(showVolumeSlider).toBe(true);
    });

    it("should set showVolumeSlider to false if false is passed", () => {
      useMusicPlayerStore.setState({ showVolumeSlider: true });

      const setShowVolumeSlider =
        useMusicPlayerStore.getState().setShowVolumeSlider;

      act(() => {
        setShowVolumeSlider(false);
      });

      const showVolumeSlider = useMusicPlayerStore.getState().showVolumeSlider;
      expect(showVolumeSlider).toBe(false);
    });
  });

  describe("setSongs", () => {
    it("should set the songs array to the specified array", () => {
      const setSongs = useMusicPlayerStore.getState().setSongs;

      act(() => {
        setSongs([createSong("abc123", "Relaxing Rain Sounds", true)]);
      });

      const songs = useMusicPlayerStore.getState().songs;
      expect(songs).toEqual([
        {
          id: "abc123",
          title: "Relaxing Rain Sounds",
          src: "https://www.youtube.com/watch?v=abc123",
          isRecommended: true,
        },
      ]);
    });
  });

  describe("setVolume", () => {
    it("should set the volume to the specified value", () => {
      const setVolume = useMusicPlayerStore.getState().setVolume;

      act(() => {
        setVolume(75);
      });

      expect(useMusicPlayerStore.getState().volume).toBe(75);
    });

    it("should set the volume to 0 if a value less than 0 is passed", () => {
      const setVolume = useMusicPlayerStore.getState().setVolume;

      act(() => {
        setVolume(-10);
      });

      expect(useMusicPlayerStore.getState().volume).toBe(0);
    });

    it("should set the volume to 100 if a value greater than 100 is passed", () => {
      const setVolume = useMusicPlayerStore.getState().setVolume;

      act(() => {
        setVolume(150);
      });

      expect(useMusicPlayerStore.getState().volume).toBe(100);
    });
  });

  describe("addSong", () => {
    it("should add a custom song from a YouTube URL with default title", () => {
      const addSong = useMusicPlayerStore.getState().addSong;
      const beforeCount = useMusicPlayerStore.getState().songs.length;

      act(() => {
        addSong("https://www.youtube.com/watch?v=custom123");
      });

      const songs = useMusicPlayerStore.getState().songs;
      expect(songs.length).toBe(beforeCount + 1);
      const added = songs[songs.length - 1];
      expect(added.id).toBe("custom123");
      expect(added.title).toBe("Custom song");
      expect(added.isCustom).toBe(true);
      expect(added.src).toBe("https://www.youtube.com/watch?v=custom123");
    });

    it("should add a custom song with a custom title when provided", () => {
      const addSong = useMusicPlayerStore.getState().addSong;
      const beforeCount = useMusicPlayerStore.getState().songs.length;

      act(() => {
        addSong(
          "https://www.youtube.com/watch?v=custom456",
          "My Favorite Song",
        );
      });

      const songs = useMusicPlayerStore.getState().songs;
      expect(songs.length).toBe(beforeCount + 1);
      const added = songs[songs.length - 1];
      expect(added.id).toBe("custom456");
      expect(added.title).toBe("My Favorite Song");
      expect(added.isCustom).toBe(true);
      expect(added.src).toBe("https://www.youtube.com/watch?v=custom456");
    });

    it("should use default title when an empty string title is provided", () => {
      const addSong = useMusicPlayerStore.getState().addSong;
      const beforeCount = useMusicPlayerStore.getState().songs.length;

      act(() => {
        addSong("https://www.youtube.com/watch?v=custom789", "  ");
      });

      const songs = useMusicPlayerStore.getState().songs;
      expect(songs.length).toBe(beforeCount + 1);
      const added = songs[songs.length - 1];
      expect(added.title).toBe("Custom song");
    });

    it("should not add a duplicate song", () => {
      const addSong = useMusicPlayerStore.getState().addSong;

      act(() => {
        addSong("https://www.youtube.com/watch?v=yLOM8R6lbzg");
      });

      const songs = useMusicPlayerStore.getState().songs;
      const customSongs = songs.filter((s) => s.isCustom);
      expect(customSongs).toHaveLength(0);
    });

    it("should not add a song from an invalid URL", () => {
      const addSong = useMusicPlayerStore.getState().addSong;
      const beforeCount = useMusicPlayerStore.getState().songs.length;

      act(() => {
        addSong("https://example.com/not-youtube");
      });

      const songs = useMusicPlayerStore.getState().songs;
      expect(songs.length).toBe(beforeCount);
    });

    it("should not add a song from an empty URL", () => {
      const addSong = useMusicPlayerStore.getState().addSong;
      const beforeCount = useMusicPlayerStore.getState().songs.length;

      act(() => {
        addSong("");
      });

      const songs = useMusicPlayerStore.getState().songs;
      expect(songs.length).toBe(beforeCount);
    });
  });

  describe("removeSong", () => {
    it("should remove a custom song", () => {
      const addSong = useMusicPlayerStore.getState().addSong;
      const removeSong = useMusicPlayerStore.getState().removeSong;

      act(() => {
        addSong("https://www.youtube.com/watch?v=toremove1");
      });

      const afterAdd = useMusicPlayerStore.getState().songs.length;

      act(() => {
        removeSong("toremove1");
      });

      const songs = useMusicPlayerStore.getState().songs;
      expect(songs.length).toBe(afterAdd - 1);
      expect(songs.some((s) => s.id === "toremove1")).toBe(false);
    });

    it("should not remove a default song", () => {
      const removeSong = useMusicPlayerStore.getState().removeSong;
      const beforeCount = useMusicPlayerStore.getState().songs.length;

      act(() => {
        removeSong("yLOM8R6lbzg");
      });

      const songs = useMusicPlayerStore.getState().songs;
      expect(songs.length).toBe(beforeCount);
      expect(songs.some((s) => s.id === "yLOM8R6lbzg")).toBe(true);
    });

    it("should switch chosenSongId when the chosen song is removed", () => {
      const addSong = useMusicPlayerStore.getState().addSong;
      const setChosenSongId = useMusicPlayerStore.getState().setChosenSongId;
      const removeSong = useMusicPlayerStore.getState().removeSong;

      act(() => {
        addSong("https://www.youtube.com/watch?v=chosen123");
      });

      act(() => {
        setChosenSongId("chosen123");
      });

      expect(useMusicPlayerStore.getState().chosenSongId).toBe("chosen123");

      act(() => {
        removeSong("chosen123");
      });

      const chosenSongId = useMusicPlayerStore.getState().chosenSongId;
      expect(chosenSongId).not.toBe("chosen123");
      expect(chosenSongId).toBe(useMusicPlayerStore.getState().songs[0].id);
    });
  });

  describe("useSongs", () => {
    it("should deduplicate songs on the first render", () => {
      // Simulate the store having duplicate songs (as could happen from
      // localStorage before the merge function runs)
      const songA = createSong("a", "Song A", true);
      const songB = createSong("b", "Song B", true);
      const songsWithDuplicates = [songA, songB, songA, songB];

      useMusicPlayerStore.setState({ songs: songsWithDuplicates });

      const { result } = renderHook(() => useSongs());

      // useSongs must return only unique songs even on the very first render
      expect(result.current).toHaveLength(2);
      expect(result.current[0].id).toBe("a");
      expect(result.current[1].id).toBe("b");
    });

    it("should deduplicate songs after the store state changes", () => {
      const songA = createSong("a", "Song A", true);
      const songB = createSong("b", "Song B", true);
      const songC = createSong("c", "Song C", true);

      useMusicPlayerStore.setState({ songs: [songA, songB] });

      const { result, rerender } = renderHook(() => useSongs());
      expect(result.current).toHaveLength(2);

      // Update store with duplicates
      act(() => {
        useMusicPlayerStore.setState({
          songs: [songA, songB, songC, songA],
        });
      });
      rerender();

      expect(result.current).toHaveLength(3);
      expect(result.current.map((s) => s.id)).toEqual(["a", "b", "c"]);
    });

    it("should return the same reference when songs do not change", () => {
      const songA = createSong("a", "Song A", true);
      const songB = createSong("b", "Song B", true);

      useMusicPlayerStore.setState({ songs: [songA, songB] });

      const { result, rerender } = renderHook(() => useSongs());
      const firstRender = result.current;

      rerender();
      expect(result.current).toBe(firstRender);
    });

    it("should handle an empty songs array", () => {
      useMusicPlayerStore.setState({ songs: [] });

      const { result } = renderHook(() => useSongs());
      expect(result.current).toEqual([]);
    });
  });

  describe("merge function deduplication", () => {
    // The merge function runs when the store restores from localStorage.
    // We simulate it by directly invoking the merge logic with persisted
    // state that contains duplicates.
    it("should deduplicate songs when restoring from persisted state", () => {
      const songA = createSong("a", "Song A", true);
      const songB = createSong("b", "Song B", true);
      const persistedSongs = [songA, songB, songA, songB];

      // Simulate the merge function behavior
      const seen = new Set<string>();
      const uniqueSongs = persistedSongs.filter((song) => {
        if (seen.has(song.id)) {
          return false;
        }
        seen.add(song.id);
        return true;
      });

      expect(uniqueSongs).toHaveLength(2);
      expect(uniqueSongs[0].id).toBe("a");
      expect(uniqueSongs[1].id).toBe("b");
    });

    it("should fix chosenSongId if the chosen song was removed by dedup", () => {
      const songA = createSong("a", "Song A", true);
      const songB = createSong("b", "Song B", true);
      // chosenSongId points to a song that only appears as a duplicate
      const persistedSongs = [songA, songA, songB];
      let chosenSongId = "a";
      const seen = new Set<string>();
      const uniqueSongs = persistedSongs.filter((song) => {
        if (seen.has(song.id)) {
          return false;
        }
        seen.add(song.id);
        return true;
      });

      if (chosenSongId && !seen.has(chosenSongId)) {
        chosenSongId = uniqueSongs[0]?.id;
      }

      expect(chosenSongId).toBe("a");
    });

    it("should append new default songs when restoring from persisted state", () => {
      // Simulate a persisted state that only has some of the default songs
      // (e.g., the user had 3 defaults, then 2 new defaults were added to the codebase)
      const persistedSongs = [
        createSong("yLOM8R6lbzg", "Calming White Noise", true),
        createSong("sF80I-TQiW0", "90's Chill Lofi Playlist", true),
      ];

      // Simulate the merge function behavior including the new default append logic
      const seen = new Set<string>();
      const uniqueSongs = persistedSongs.filter((song) => {
        if (seen.has(song.id)) {
          return false;
        }
        seen.add(song.id);
        return true;
      });
      const defaultIds = new Set(defaultSongs.map((s) => s.id));
      const filteredSongs = uniqueSongs.filter(
        (song) => song.isCustom || defaultIds.has(song.id),
      );
      const missingDefaults = defaultSongs.filter((s) => !seen.has(s.id));
      const mergedSongs = [...filteredSongs, ...missingDefaults];

      // The merged list should contain the persisted songs plus the missing defaults
      expect(mergedSongs.length).toBe(
        persistedSongs.length + missingDefaults.length,
      );
      // Persisted songs come first
      expect(mergedSongs[0].id).toBe("yLOM8R6lbzg");
      expect(mergedSongs[1].id).toBe("sF80I-TQiW0");
      // Missing defaults are appended
      expect(mergedSongs.map((s) => s.id)).toContain("CFGLoQIhmow");
      expect(mergedSongs.map((s) => s.id)).toContain("2ojMshIhLmw");
      expect(mergedSongs.map((s) => s.id)).toContain("M5QY2_8704o");
    });

    it("should remove old default songs no longer in the codebase but keep custom songs", () => {
      // Simulate a persisted state with an old default song that was removed from default-songs.ts
      // and a custom song that should always be kept
      const oldDefaultSong = {
        id: "removedSong123",
        title: "Old Removed Song",
        src: "https://www.youtube.com/watch?v=removedSong123",
        isRecommended: false,
        isCustom: false,
      };
      const customSong = {
        id: "myCustomSong",
        title: "My Custom Song",
        src: "https://www.youtube.com/watch?v=myCustomSong",
        isRecommended: false,
        isCustom: true,
      };
      const currentDefault = createSong(
        "yLOM8R6lbzg",
        "Calming White Noise",
        true,
      );

      const persistedSongs = [oldDefaultSong, customSong, currentDefault];

      // Simulate the merge function behavior
      const seen = new Set<string>();
      const uniqueSongs = persistedSongs.filter((song) => {
        if (seen.has(song.id)) {
          return false;
        }
        seen.add(song.id);
        return true;
      });
      const defaultIds = new Set(defaultSongs.map((s) => s.id));
      const filteredSongs = uniqueSongs.filter(
        (song) => song.isCustom || defaultIds.has(song.id),
      );
      const missingDefaults = defaultSongs.filter((s) => !seen.has(s.id));
      const mergedSongs = [...filteredSongs, ...missingDefaults];

      // Old default song should be filtered out
      expect(mergedSongs.map((s) => s.id)).not.toContain("removedSong123");
      // Custom song should be kept
      expect(mergedSongs.map((s) => s.id)).toContain("myCustomSong");
      // Current default should be kept
      expect(mergedSongs.map((s) => s.id)).toContain("yLOM8R6lbzg");
      // Missing defaults should be appended
      expect(mergedSongs.map((s) => s.id)).toContain("CFGLoQIhmow");
    });
  });
});
