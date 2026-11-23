import { useMusicPlayerStore } from "@/features/music-player/stores/store";
import { act } from "@testing-library/react";

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
});
