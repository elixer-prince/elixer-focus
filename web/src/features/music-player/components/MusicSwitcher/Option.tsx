import {
  useChosenSongId,
  useSetChosenSongId,
} from "@/features/music-player/stores/store";

interface OptionProps {
  id: number;
  title: string;
  isRecommended: boolean;
}

const Option = ({ id, title, isRecommended }: OptionProps) => {
  const chosenSongId = useChosenSongId();
  const setChosenSongId = useSetChosenSongId();

  return (
    <li className="menu-item">
      <label aria-label={`Switch to '${title}'`}>
        <input
          className="radio radio-primary radio-sm"
          name="song-choice"
          type="radio"
          onChange={() => setChosenSongId(id)}
          checked={chosenSongId === id}
        />
        <div
          className={`flex flex-wrap items-center gap-2 ${chosenSongId === id ? "font-bold" : ""}`}
        >
          {isRecommended && (
            <span className="badge badge-sm badge-secondary badge-soft">
              Recommended
            </span>
          )}
          <span className="w-34">{title}</span>
        </div>
      </label>
    </li>
  );
};

export default Option;
