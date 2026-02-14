interface ThemePreviewProps {
  theme: string;
  selected?: boolean;
}

const ThemePreview = ({ theme, selected }: ThemePreviewProps) => {
  return (
    <div
      data-theme={theme}
      className={`relative size-16 overflow-hidden rounded-full transition-all duration-300 ${
        selected
          ? "border-primary ring-primary/50 ring-3"
          : "border-base-300 hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(var(--color-primary),0.25)]"
      }`}
    >
      {/* Mini UI */}
      <div className={"bg-base-300 flex h-full w-full flex-col gap-1 p-2"}>
        {/* Header */}
        <div className={"flex items-center justify-between"}>
          <div className={"bg-base-200 h-1.5 w-6 rounded"} />
          <div className={"bg-base-content/50 h-1 w-3 rounded"} />
        </div>

        {/* Colours */}
        <div className={"flex gap-1"}>
          <div className={"bg-primary size-2 rounded-full"} />
          <div className={"bg-secondary size-2 rounded-full"} />
          <div className={"bg-accent size-2 rounded-full"} />
          <div className={"bg-neutral size-2 rounded-full"} />
        </div>

        {/* Button */}
        <div className={"bg-primary/90 mt-auto h-2.5 w-full rounded"} />
      </div>

      {/* Selected Tick */}
      {selected && (
        <div
          className={
            "text-primary-content bg-primary absolute top-1 right-1 z-10 grid size-4 place-items-center rounded-full text-[10px]"
          }
        >
          ✓
        </div>
      )}
    </div>
  );
};

export default ThemePreview;
