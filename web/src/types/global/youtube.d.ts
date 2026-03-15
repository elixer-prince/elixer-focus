export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var YT: any;
  var onYouTubeIframeAPIReady: () => void;
}
