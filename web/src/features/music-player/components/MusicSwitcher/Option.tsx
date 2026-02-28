interface OptionProps {
  id: number;
  title: string;
  chosenSongId: number;
  setChosenSongId: (id: number) => void;
}

const Option = ({ id, title, chosenSongId, setChosenSongId }: OptionProps) => {
  return (
    <li className="menu-item">
      <label className="hover:bg-base-200 flex cursor-pointer items-center gap-2 p-2">
        <input
          className="radio radio-primary radio-sm"
          name="song-choice"
          type="radio"
          onChange={() => setChosenSongId(id)}
          checked={chosenSongId === id}
        />
        <span className="flex-1">{title}</span>
      </label>
    </li>
  );
};

export default Option;
