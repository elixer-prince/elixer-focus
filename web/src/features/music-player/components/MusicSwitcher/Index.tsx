import Option from "@/features/music-player/components/MusicSwitcher/Option";
import {
  useChosenSongId,
  useSetChosenSongId,
  useSongs,
} from "@/stores/music-player";

const MusicSwitcher = () => {
  const songs = useSongs();
  const chosenSongId = useChosenSongId();
  const setChosenSongId = useSetChosenSongId();

  return (
    <div className="music-switcher dropdown dropdown-top dropdown-center">
      <button tabIndex={0} className="dropdown-toggle btn btn-soft btn-ghost">
        Switch Song
      </button>

      <ul
        tabIndex={-1}
        className="music-list dropdown-content menu bg-base-100 rounded-box z-1 flex w-52 gap-2 p-2 shadow-sm"
      >
        {songs.map(({ id, title }) => (
          <Option
            key={id}
            id={id}
            title={title}
            chosenSongId={chosenSongId}
            setChosenSongId={setChosenSongId}
          />
        ))}
      </ul>
    </div>
  );
};

export default MusicSwitcher;
