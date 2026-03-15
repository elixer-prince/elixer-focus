import Option from "@/features/music-player/components/MusicSwitcher/Option";
import { useSongs } from "@/features/music-player/stores/store";

const OptionsContainer = () => {
  const songs = useSongs();

  return (
    <ul
      tabIndex={-1}
      className="music-list dropdown-content menu bg-base-100 rounded-box p-2 shadow-sm"
    >
      {songs.map(({ id, title, isRecommended }) => (
        <Option key={id} id={id} title={title} isRecommended={isRecommended} />
      ))}
    </ul>
  );
};

export default OptionsContainer;
