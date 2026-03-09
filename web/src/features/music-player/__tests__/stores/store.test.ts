import { useMusicPlayerStore } from "@/features/music-player/stores/store";
import { act } from "@testing-library/react";
import { use } from "react";

const createSong = (id: number, title: string, isRecommended: boolean) => ({
  id,
  title,
  src: `https://www.youtube.com/watch?v=example${id}`,
  isRecommended,
});

beforeEach(() => {
  useMusicPlayerStore.setState({
    songs: [
      createSong(1, "Calming White Noise", true),
      createSong(2, "90's Chill Lofi Playlist", true),
      createSong(3, "Lofi Radio (Lofi Girl)", true),
      createSong(4, "Chillstep Music for Programming", false),
    ],
    volume: 50,
  });
});

describe("Music Player Store", () => {
  describe("setChosenSongId", () => {
    it("should set the chosen song id to the id specified", () => {
      useMusicPlayerStore.setState({ chosenSongId: 1 });
      const setChosenSongId = useMusicPlayerStore.getState().setChosenSongId;

      act(() => {
        setChosenSongId(2);
      });

      const chosenSongId = useMusicPlayerStore.getState().chosenSongId;
      expect(chosenSongId).toBe(2);
    });

    it("should throw an error if the id specified does not exist in the songs array", () => {
      const setChosenSongId = useMusicPlayerStore.getState().setChosenSongId;

      expect(() => setChosenSongId(999)).toThrowError(/id 999 was not found/i);
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
        setSongs([createSong(3, "Relaxing Rain Sounds", true)]);
      });

      const songs = useMusicPlayerStore.getState().songs;
      expect(songs).toEqual([
        {
          id: 3,
          title: "Relaxing Rain Sounds",
          src: "https://www.youtube.com/watch?v=example3",
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
});
