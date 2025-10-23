import { useRef, useState } from "react";

const MusicPlayer = () => {
    const playerRef = useRef<HTMLDivElement>(null);
    // @ts-ignore
    const [songs, setSongs] = useState([
        {
            id: 1,
            title: "Calming White Noise",
            src: "https://www.youtube.com/watch?v=yLOM8R6lbzg",
            isRecommended: true,
        },
        {
            id: 2,
            title: "Lofi Radio (Lofi Girl)",
            src: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
            isRecommended: true,
        },
        {
            id: 3,
            title: "90s Chill Lofi Playlist",
            src: "https://www.youtube.com/watch?v=sF80I-TQiW0",
            isRecommended: false,
        },
        {
            id: 4,
            title: "Chillstep Music for Programming / Cyber / Coding",
            src: "https://www.youtube.com/watch?v=M5QY2_8704o",
            isRecommended: false,
        },
    ]);

    return (
        <div className={"mb-2"}>
            <p className={"font-bold"}>Choose a song:</p>

            {songs.map(({ id, title, isRecommended }) => (
                <label key={id} htmlFor="song" className={"block"}>
                    {/* TODO: Fix the repeated id/htmlFor thing after learning more about hooks */}
                    <input id={"song"} type="radio" />
                    <span>{title}</span>
                    {isRecommended && (
                        <span
                            className={
                                "rounded-full border-2 px-2 py-1 text-xs font-bold text-neutral-500"
                            }
                        >
                            Recommended
                        </span>
                    )}
                </label>
            ))}

            {/* YouTube Player */}
            <div ref={playerRef}></div>

            <iframe
                width="560"
                height="315"
                src="https://www.youtube.com/embed/jfKfPfyJRdk?si=prpM1CsnFkf_dP9-"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media;
                gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default MusicPlayer;
