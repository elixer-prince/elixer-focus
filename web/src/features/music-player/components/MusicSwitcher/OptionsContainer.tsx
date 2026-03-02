import Option from "@/features/music-player/components/MusicSwitcher/Option";
import {
  useChosenSongId,
  useSetChosenSongId,
  useSongs,
} from "@/features/music-player/stores/store";

const OptionsContainer = () => {
  const songs = useSongs();
  const chosenSongId = useChosenSongId();
  const setChosenSongId = useSetChosenSongId();

  return (
    <ul
      tabIndex={-1}
      className="music-list dropdown-content menu bg-base-100 rounded-box p-2 shadow-sm"
    >
      {songs.map(({ id, title, isRecommended }) => (
        <Option
          key={id}
          id={id}
          title={title}
          isRecommended={isRecommended}
          chosenSongId={chosenSongId}
          setChosenSongId={setChosenSongId}
        />
      ))}
    </ul>
  );
};

export default OptionsContainer;
