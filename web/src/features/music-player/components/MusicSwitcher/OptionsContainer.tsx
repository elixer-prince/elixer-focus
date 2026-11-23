import Option from "@/features/music-player/components/MusicSwitcher/Option";
import { useAddSong, useSongs } from "@/features/music-player/stores/store";
import { useState, useCallback } from "react";

const OptionsContainer = () => {
  const songs = useSongs();
  const addSong = useAddSong();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        setError("Please enter a YouTube URL");
        return;
      }
      const videoId = trimmedUrl.match(/[?&]v=([^&#]*)/)?.[1];
      if (!videoId) {
        setError("Invalid YouTube URL");
        return;
      }
      if (songs.some((song) => song.id === videoId)) {
        setError("This song is already in your playlist");
        return;
      }
      const trimmedTitle = title.trim();
      addSong(trimmedUrl, trimmedTitle || undefined);
      setUrl("");
      setTitle("");
      setError("");
    },
    [url, title, songs, addSong],
  );

  return (
    <div className="dropdown-content w-72">
      <ul
        tabIndex={-1}
        className="music-list menu bg-base-100 rounded-box p-2 shadow-sm"
      >
        {songs.map(({ id, title, isRecommended, isCustom }) => (
          <Option
            key={id}
            id={id}
            title={title}
            isRecommended={isRecommended}
            isCustom={isCustom}
          />
        ))}
      </ul>
      <form onSubmit={handleAdd} className="mt-2 flex flex-col gap-1 px-1">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("");
          }}
          placeholder="YouTube URL..."
          className={`input input-sm input-bordered ${error ? "input-error" : ""}`}
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Song title (optional)..."
          className="input input-sm input-bordered"
        />
        <button type="submit" className="btn btn-sm btn-primary">
          Add
        </button>
      </form>
      {error && <p className="text-error mt-1 px-1 text-xs">{error}</p>}
    </div>
  );
};

export default OptionsContainer;
