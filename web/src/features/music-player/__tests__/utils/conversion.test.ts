import { getVideoId } from "@/features/music-player/utils/conversion";

describe("utils.conversion", () => {
  describe("getVideoId", () => {
    it("should extract the video ID from a standard YouTube URL", () => {
      const url = "https://www.youtube.com/watch?v=VIDEO_ID";
      const videoId = getVideoId(url);
      expect(videoId).toBe("VIDEO_ID");
    });
  });
});
