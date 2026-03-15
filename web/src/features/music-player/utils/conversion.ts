export const getVideoId = (url: string): string => {
  const match = url.match(/[?&]v=([^&#]*)/);
  return match ? match[1] : url;
};
