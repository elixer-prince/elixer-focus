interface OptionProps {
  id: number;
  title: string;
  isRecommended: boolean;
  chosenSongId: number;
  setChosenSongId: (id: number) => void;
}

const Option = ({
  id,
  title,
  isRecommended,
  chosenSongId,
  setChosenSongId,
}: OptionProps) => {
  return (
    <li className="menu-item">
      <label>
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
