import { convertMinutesToSeconds } from "@/utils/conversion";

describe("convertMinutesToSeconds", () => {
  it("should return 60 when given 1 as an argument", () => {
    const result = convertMinutesToSeconds(1);
    expect(result).toBe(60);
  });

  it("should return -60 when given -1 as an argument", () => {
    const result = convertMinutesToSeconds(-1);
    expect(result).toBe(-60);
  });
});
