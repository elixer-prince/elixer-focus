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
    <section className={"size-full"}>
      <header className={"mb-8"}>
        <h1 className={"text-primary mb-1 text-xl font-bold"}>
          Theme Settings
        </h1>
        <p className={"text-base-content/60 text-sm"}>
          Pick a visual theme for the app. Your choice is saved automatically
          and applied across all pages.
        </p>
      </header>

      <div className={"mb-6"}>
        <input
          type={"text"}
          placeholder={"Search themes..."}
          className={
            "input input-bordered w-full max-w-xs transition-colors duration-500"
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredThemes.length === 0 ? (
        <p className={"text-base-content/50"}>No themes match your search.</p>
      ) : (
        <div
          className={
            "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          }
        >
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
      )}
    </section>
  );
};

export default ThemeSettings;
