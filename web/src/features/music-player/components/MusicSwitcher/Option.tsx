interface OptionProps {
  id: number;
  title: string;
  chosenSongId: number;
  setChosenSongId: (id: number) => void;
}

const Option = ({ id, title, chosenSongId, setChosenSongId }: OptionProps) => {
  return (
    <label key={id} className="music-option bg-red-500">
      <input
        name="song-choice"
        type="radio"
        className={`${chosenSongId === id ? "accent-primary" : ""}`}
        onChange={() => setChosenSongId(id)}
        checked={chosenSongId === id}
      />
      {title}
    </label>
  );
};

export default Option;
