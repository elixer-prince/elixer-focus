import {
  convertMillisecondsToSeconds,
  convertMinutesToMilliseconds,
  convertMinutesToSeconds,
  convertSecondsToMilliseconds,
  convertSecondsToMinutes,
} from "@/utils/conversion";

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

describe("convertMinutesToMilliseconds", () => {
  it("should return 60000 when given 1 as an argument", () => {
    expect(convertMinutesToMilliseconds(1)).toBe(60000);
  });

  it("should return -60000 when given -1 as an argument", () => {
    expect(convertMinutesToMilliseconds(-1)).toBe(-60000);
  });
});

describe("convertSecondsToMinutes", () => {
  it("should return 1 when given 60 as an argument", () => {
    expect(convertSecondsToMinutes(60)).toBe(1);
  });

  it("should return -1 when given -60 as an argument", () => {
    expect(convertSecondsToMinutes(-60)).toBe(-1);
  });
});

describe("convertSecondsToMilliseconds", () => {
  it("should return 1000 when given 1 as an argument", () => {
    expect(convertSecondsToMilliseconds(1)).toBe(1000);
  });

  it("should return -1000 when given -1 as an argument", () => {
    expect(convertSecondsToMilliseconds(-1)).toBe(-1000);
  });
});

describe("convertMillisecondsToSeconds", () => {
  it("should return 1 when given 1000 as an argument", () => {
    expect(convertMillisecondsToSeconds(1000)).toBe(1);
  });

  it("should return -1 when given -1000 as an argument", () => {
    expect(convertMillisecondsToSeconds(-1000)).toBe(-1);
  });
});
