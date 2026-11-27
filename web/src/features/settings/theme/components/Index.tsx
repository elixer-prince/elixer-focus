import { allThemes } from "@/config/themes";
import ThemeLabel from "@/features/settings/theme/components/ThemeLabel";
import { useState } from "react";
import toast from "react-hot-toast";

const ThemeSettings = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredThemes = allThemes.filter((theme) =>
    theme.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleThemeChange = (themeName: string) => {
    toast.success(`Theme changed to ${themeName}`);
  };

  return (
    <section className={"size-full max-w-6xl"}>
      <header className={"mb-8 max-w-3xl"}>
        <h1
          className={
            "text-base-content mb-1 text-2xl font-semibold tracking-tight"
          }
        >
          Theme Settings
        </h1>
        <p className={"text-base-content/70 text-sm sm:text-base"}>
          Pick a visual theme for the app. Your choice is saved automatically
          and applied across all pages.
        </p>
      </header>

      <div className={"mb-6 max-w-lg"}>
        <label
          className="label-text mb-2 block font-medium"
          htmlFor="theme-search"
        >
          Search themes
        </label>
        <input
          id="theme-search"
          type={"text"}
          placeholder={"Search themes..."}
          className={
            "input input-bordered w-full transition-colors duration-500"
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredThemes.length === 0 ? (
        <p
          className="border-base-300 text-base-content/70 rounded-box border border-dashed p-6 text-center"
          role="status"
        >
          No themes match your search.
        </p>
      ) : (
        <fieldset>
          <legend className="mb-4 font-semibold">Available themes</legend>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredThemes.map((theme) => (
              <ThemeLabel
                key={theme.value}
                value={theme.value}
                onThemeChange={handleThemeChange}
              >
                {theme.label}
              </ThemeLabel>
            ))}
          </div>
        </fieldset>
      )}
    </section>
  );
};

export default ThemeSettings;
