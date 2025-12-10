import useMusicPlayerContext from "@features/MusicPlayer/stores/useMusicPlayerContext";

const MusicPlayer = () => {
    const { songs, playerRef } = useMusicPlayerContext();

    return (
        <div className={"mb-2"}>
            <p className={"font-bold"}>Choose a song:</p>

            {songs.map(({ id, title, isRecommended }) => (
                <label key={id} htmlFor="song" className={"block"}>
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
