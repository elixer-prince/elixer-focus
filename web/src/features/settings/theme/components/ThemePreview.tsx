interface ThemePreviewProps {
  theme: string;
  selected?: boolean;
}

const ThemePreview = ({ theme, selected }: ThemePreviewProps) => {
  return (
    <div
      data-theme={theme}
      data-testid={`theme-preview-${theme}`}
      className={`relative overflow-hidden rounded-xl transition-all duration-500 ${
        selected
          ? "border-primary ring-primary/30 border-2 ring-2"
          : "border-base-300 hover:border-primary/50 border hover:-translate-y-1 hover:shadow-lg"
      }`}
    >
      {/* Preview area -- shows the theme's actual UI feel */}
      <div className={"bg-base-100 flex flex-col p-3"}>
        {/* Mock header bar */}
        <div className={"mb-2 flex items-center justify-between"}>
          <div className={"bg-primary/20 h-2 w-12 rounded-full"} />
          <div className={"flex gap-1"}>
            <div className={"bg-base-content/20 h-2 w-2 rounded-full"} />
            <div className={"bg-base-content/20 h-2 w-2 rounded-full"} />
          </div>
        </div>

        {/* Color palette strip */}
        <div className={"mb-2 flex gap-1.5"}>
          <div className={"bg-primary h-6 flex-1 rounded-lg"} />
          <div className={"bg-secondary h-6 flex-1 rounded-lg"} />
          <div className={"bg-accent h-6 flex-1 rounded-lg"} />
          <div className={"bg-neutral h-6 flex-1 rounded-lg"} />
        </div>

        {/* Mock content lines */}
        <div className={"flex flex-col gap-1.5"}>
          <div className={"bg-base-200 h-2 w-3/4 rounded"} />
          <div className={"bg-base-200 h-2 w-1/2 rounded"} />
        </div>

        {/* Mock button */}
        <div className={"bg-primary mt-2 h-5 w-full rounded-lg"} />
      </div>

      {/* Selected check mark overlay */}
      {selected && (
        <div
          aria-hidden="true"
          className={
            "text-primary-content bg-primary absolute top-2 right-2 z-10 grid size-5 place-items-center rounded-full text-xs shadow-md"
          }
        >
          ✓
        </div>
      )}
    </div>
  );
};

export default ThemePreview;
