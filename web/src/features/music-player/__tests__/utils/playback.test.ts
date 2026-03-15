import type { YTPlayer } from "@/features/music-player/types/player";
import { pauseVideo, playVideo } from "@/features/music-player/utils/playback";
import type { RefObject } from "react";
import { describe } from "vitest";

describe("utils.playback", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn");
    errorSpy = vi.spyOn(console, "error");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("playVideo", () => {
    it("should return a console warning if the player is not available", () => {
      const ref: RefObject<YTPlayer | null> = { current: null };
      playVideo(ref);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/youtube player not available/i),
      );
    });

    it("should throw a console error if the video fails to play", () => {
      const mockPlayer = {
        playVideo: vi.fn(() => {
          throw new Error("fail");
        }),
      } as unknown as YTPlayer;
      const ref: RefObject<YTPlayer | null> = {
        current: mockPlayer,
      };

      playVideo(ref);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/failed to play video/i),
      );
    });
  });

  describe("pauseVideo", () => {
    it("should return a console warning if the player is not available", () => {
      const ref: RefObject<YTPlayer | null> = { current: null };
      pauseVideo(ref);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/youtube player not available/i),
      );
    });

    it("should throw a console error if the video fails to pause", () => {
      const mockPlayer = {
        pauseVideo: vi.fn(() => {
          throw new Error("fail");
        }),
      } as unknown as YTPlayer;
      const ref: RefObject<YTPlayer | null> = {
        current: mockPlayer,
      };

      pauseVideo(ref);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringMatching(/failed to pause video/i),
      );
    });
  });
});
