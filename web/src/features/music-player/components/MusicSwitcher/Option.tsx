interface OptionProps {
  id: number;
  title: string;
  chosenSongId: number;
  setChosenSongId: (id: number) => void;
}

const Option = ({ id, title, chosenSongId, setChosenSongId }: OptionProps) => {
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
        <span className={chosenSongId === id ? "font-bold" : ""}>{title}</span>
      </label>
    </li>
  );
};

export default Option;
