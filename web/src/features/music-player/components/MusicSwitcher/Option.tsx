interface OptionProps {
  id: number;
  title: string;
  chosenSongId: number;
  setChosenSongId: (id: number) => void;
}

const Option = ({ id, title, chosenSongId, setChosenSongId }: OptionProps) => {
  return (
    <label key={id} className="music-option px-4 py-2">
      <input
        name="session-type"
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
