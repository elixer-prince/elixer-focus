import { allThemes } from "@/config/themes";
import { useCurrentTheme } from "@/stores";

const ProfileTheme = () => {
  const currentTheme = useCurrentTheme();
  const themeLabel =
    allThemes.find((theme) => theme.value === currentTheme)?.label ??
    currentTheme;

  return (
    <section
      aria-labelledby="profile-theme-heading"
      className="bg-base-100 rounded-box border-base-300 space-y-4 border p-6 shadow-sm transition-colors duration-500"
    >
      <header>
        <h2
          id="profile-theme-heading"
          className="text-base-content text-xl font-semibold"
        >
          Your theme
        </h2>
        <p className="text-base-content/60 mt-1 text-sm">
          Your selected app theme, shown here for reference.
        </p>
      </header>

      <div className="border-base-300 flex items-center justify-between gap-4 rounded-lg border p-4">
        <span className="text-base-content font-medium">Current theme</span>
        <span className="border-base-300 bg-base-200 text-base-content rounded-lg border px-3 py-1 text-sm">
          {themeLabel}
        </span>
      </div>
      <p className="text-base-content/50 text-sm">
        Change your theme in Settings.
      </p>
    </section>
  );
};

export default ProfileTheme;
