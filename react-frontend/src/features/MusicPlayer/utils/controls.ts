export const onPlayerReady = (event: any) => {
    event.target.playVideo();
};

export const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.ENDED) {
    }
};

export const playVideo = (player: any) => {
    player?.playVideo();
};

export const pauseVideo = (player: any) => {
    player?.pauseVideo();
};
