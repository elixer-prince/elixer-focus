interface OptionProps {
  id: number;
  title: string;
  chosenSongId: number;
  setChosenSongId: (id: number) => void;
}

const Option = ({ id, title, chosenSongId, setChosenSongId }: OptionProps) => {
  return (
    <label>
      <input
        name="song-choice"
        type="radio"
        className="song-option accent-primary"
        onChange={() => setChosenSongId(id)}
        checked={chosenSongId === id}
      />
      {title}
    </label>
  );
};

export default Option;
