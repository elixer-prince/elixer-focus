// import { useEffect, useRef, useState } from "react";
//
// const music-player = () => {
//     // @ts-ignore
//     const [chosenSongIndex, setChosenSongIndex] = useState(0);
//     // @ts-ignore
//     let player;
//     // @ts-ignore
//     const [playbackPaused, setPlaybackPaused] = useState(false);
//     const playerRef = useRef<HTMLDivElement>(null);
//     // @ts-ignore
//     const [songs, setSongs] = useState([
//         {
//             id: 1,
//             title: "Calming White Noise",
//             src: "https://www.youtube.com/watch?v=yLOM8R6lbzg",
//             isRecommended: true,
//         },
//         {
//             id: 2,
//             title: "Lofi Radio (Lofi Girl)",
//             src: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
//             isRecommended: true,
//         },
//         {
//             id: 3,
//             title: "90s Chill Lofi Playlist",
//             src: "https://www.youtube.com/watch?v=sF80I-TQiW0",
//             isRecommended: false,
//         },
//         {
//             id: 4,
//             title: "Chillstep Music for Programming / Cyber / Coding",
//             src: "https://www.youtube.com/watch?v=M5QY2_8704o",
//             isRecommended: false,
//         },
//     ]);
//
//     useEffect(() => {
//         loadVideoIfPlayerExists(chosenSongIndex);
//
//         if (youtubeAPIAlreadyLoaded()) return createPlayer();
//
//         window._createPlayerAfterAPI();
//     }, []);
//
//     const onYouTubeIframeAPIReady = () => {
//         if (window._createPlayerAfterAPI) {
//             window._createPlayerAfterAPI();
//         }
//     };
//
//     const youtubeAPIAlreadyLoaded = () => {
//         return window.YT && YT.Player;
//     };
//
//     const playVideo = () => {
//         player.playVideo();
//         videoPaused = false;
//     };
//
//     const pauseVideo = () => {
//         player.pauseVideo();
//         videoPaused = true;
//     };
//
//     const extractVideoId = (url: string) => {
//         const match = url.match(/(?:v=|youtu\.be\/)([^&]+)/);
//         return match ? match[1] : null;
//     };
//
//     const getChosenVideoURL = () => {
//         return playlist[chosenSongIndex].src;
//     };
//
//     const loadVideoIfPlayerExists = (value: number) => {
//         if (videoPlayerExists()) {
//             const videoId = extractVideoId(playlist[value].src);
//             player.loadVideoById(videoId);
//         }
//     };
//
//     const videoPlayerExists = () => {
//         return player;
//     };
//
//     const instantiateVideoPlayer = (playerObject: any) => {
//         return new YT.Player("player", playerObject);
//     };
//
//     const createPlayer = () => {
//         const videoId = this.extractVideoId(this.getChosenVideoURL());
//
//         player = instantiateVideoPlayer({
//             videoId: videoId,
//             host: "https://www.youtube-nocookie.com",
//             playerVars: { autoplay: 1, playsinline: 1 },
//             events: {
//                 onReady: (event) => event.target.playVideo(),
//             },
//         });
//     };
//
//     return (
//         <div className={"mb-2"}>
//             <p className={"font-bold"}>Choose a song:</p>
//
//             {songs.map(({ id, title, isRecommended }) => (
//                 <label key={id} htmlFor="song" className={"block"}>
//                     {/* TODO: Fix the repeated id/htmlFor thing after learning more about hooks */}
//                     <input id={"song"} type="radio" />
//                     <span>{title}</span>
//                     {isRecommended && (
//                         <span
//                             className={
//                                 "rounded-full border-2 px-2 py-1 text-xs font-bold text-neutral-500"
//                             }
//                         >
//                             Recommended
//                         </span>
//                     )}
//                 </label>
//             ))}
//
//             {/* YouTube Player */}
//             <div ref={playerRef}></div>
//
//             <iframe
//                 width="560"
//                 height="315"
//                 src="https://www.youtube.com/embed/jfKfPfyJRdk?si=prpM1CsnFkf_dP9-"
//                 title="YouTube video player"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media;
//                 gyroscope; picture-in-picture; web-share"
//                 referrerPolicy="strict-origin-when-cross-origin"
//                 allowFullScreen
//             ></iframe>
//         </div>
//     );
// };
//
// export default music-player;
