import type { Dispatch, SetStateAction } from "react";

interface ColumnHeaderProps {
  title: string;
  category: string;
  inputShown: boolean;
  setInputShown: Dispatch<SetStateAction<boolean>>;
  isDragging?: boolean;
  isTaskMatrix?: boolean;
}

const ColumnHeader = ({
  title,
  category,
  inputShown,
  setInputShown,
  isDragging = false,
  isTaskMatrix = false,
}: ColumnHeaderProps) => {
  return (
    <header className="tasks-container__header flex items-center justify-between gap-3 p-4">
      <h2 className="tasks-list__heading bg-base-200 sticky top-0 min-w-0 flex-1 text-left text-lg leading-snug font-semibold select-none sm:text-xl">
        {title} Tasks
      </h2>

      {category !== "uncategorised" && isTaskMatrix && (
        <>
          {inputShown ? (
            <button
              className="cancel-button btn btn-sm btn-soft btn-primary min-h-11 shrink-0"
              onClick={() => setInputShown(!inputShown)}
            >
              Cancel
            </button>
          ) : (
            <button
              className="add-task-button btn btn-sm btn-soft btn-primary min-h-11 shrink-0"
              disabled={isDragging}
              onClick={() => {
                if (isDragging) return;
                setInputShown(!inputShown);
              }}
            >
              Add task
            </button>
          )}
        </>
      )}
    </header>
  );
};

export default ColumnHeader;
