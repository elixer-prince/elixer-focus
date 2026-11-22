import { playSound, stopSound } from "@/utils/sound";

describe("sound utilities", () => {
  let mockAudio: HTMLAudioElement;
  let playPromise: Promise<void>;
  let playReject: (reason: unknown) => void;
  let playResolve: () => void;

  beforeEach(() => {
    playReject = () => {};
    playResolve = () => {};
    playPromise = new Promise((resolve, reject) => {
      playResolve = resolve;
      playReject = reject;
    });

    mockAudio = {
      pause: vi.fn(),
      play: vi.fn(() => playPromise),
      currentTime: 0,
      loop: false,
      src: "mock-audio.mp3",
    } as unknown as HTMLAudioElement;
  });

  describe("playSound", () => {
    it("should do nothing when sound is null", () => {
      playSound(null as unknown as HTMLAudioElement);
      expect(mockAudio.play).not.toHaveBeenCalled();
    });

    it("should pause and reset the sound before playing", () => {
      playSound(mockAudio);
      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.currentTime).toBe(0);
      expect(mockAudio.play).toHaveBeenCalled();
    });

    it("should not throw when play() resolves successfully", async () => {
      playSound(mockAudio);
      await Promise.resolve();
      playResolve();
      await Promise.resolve();
    });

    it("should silently ignore AbortError from play()", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const abortError = new DOMException(
        "The play() request was interrupted by a call to pause().",
        "AbortError",
      );
      playReject(abortError);

      playSound(mockAudio);
      await Promise.resolve();
      await Promise.resolve();

      expect(errorSpy).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it("should log non-AbortError errors from play()", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const otherError = new Error("Network error");
      playReject(otherError);

      playSound(mockAudio);
      await Promise.resolve();
      await Promise.resolve();

      expect(errorSpy).toHaveBeenCalledWith(
        `Error playing sound: ${mockAudio.src}`,
        otherError,
      );
      errorSpy.mockRestore();
    });

    it("should log synchronous errors from play()", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      (mockAudio.play as jest.Mock).mockImplementation(() => {
        throw new Error("Sync error");
      });

      playSound(mockAudio);

      expect(errorSpy).toHaveBeenCalledWith(
        `Error playing sound: ${mockAudio.src}`,
        expect.any(Error),
      );
      errorSpy.mockRestore();
    });
  });

  describe("stopSound", () => {
    it("should do nothing when sound is null", () => {
      stopSound(null as unknown as HTMLAudioElement);
    });

    it("should pause and reset currentTime", () => {
      stopSound(mockAudio);
      expect(mockAudio.pause).toHaveBeenCalled();
      expect(mockAudio.currentTime).toBe(0);
    });

    it("should log errors from pause()", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      (mockAudio.pause as jest.Mock).mockImplementation(() => {
        throw new Error("Pause error");
      });

      stopSound(mockAudio);

      expect(errorSpy).toHaveBeenCalledWith(
        `Error pausing sound: ${mockAudio.src}`,
        expect.any(Error),
      );
      errorSpy.mockRestore();
    });
  });
});
