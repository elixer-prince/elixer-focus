// import { useMusicPlayerContext } from "@/features/MusicPlayer/stores/MusicPlayerContext.tsx";

const MusicSwitcher = () => {
    // const { songs, chosenSongId, setChosenSongId } = useMusicPlayerContext();

    return (
        <div className="dropdown dropdown-top dropdown-center">
            <div tabIndex={0} role="button" className="btn btn-soft btn-ghost">
                Switch Song
            </div>

            <ul
                tabIndex={-1}
                className="dropdown-content menu bg-base-100 rounded-box z-1 flex w-52 gap-2 p-2 shadow-sm"
            >
                {/* {songs.map(({ id, title }) => (
                    <label
                        key={id}
                        className="hover:base-content border px-4 py-2"
                    >
                        <input
                            name="session-type"
                            type="radio"
                            className={`${chosenSongId === id ? "accent-primary" : ""}`}
                            onChange={() => setChosenSongId(id)}
                            checked={chosenSongId === id}
                        />
                        {title}
                    </label>
                ))} */}
            </ul>
        </div>
    );
};

export default MusicSwitcher;
