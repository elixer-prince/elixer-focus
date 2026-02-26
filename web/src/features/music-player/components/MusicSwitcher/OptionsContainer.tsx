import Option from "@/features/music-player/components/MusicSwitcher/Option";
import {
  useChosenSongId,
  useSetChosenSongId,
  useSongs,
} from "@/stores/music-player";

const OptionsContainer = () => {
  const songs = useSongs();
  const chosenSongId = useChosenSongId();
  const setChosenSongId = useSetChosenSongId();

  return (
    <ul
      tabIndex={-1}
      className="music-list dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
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
  );
};

export default OptionsContainer;
