import type { Dispatch, SetStateAction } from "react";
import { useLocation } from "react-router";

interface ColumnHeaderProps {
  title: string;
  category: string;
  inputShown: boolean;
  setInputShown: Dispatch<SetStateAction<boolean>>;
  isDragging?: boolean;
}

const ColumnHeader = ({
  title,
  category,
  inputShown,
  setInputShown,
  isDragging = false,
}: ColumnHeaderProps) => {
  const location = useLocation();

  return (
    <header className="tasks-container__header flex items-center justify-center gap-2 p-4">
      <h2 className="tasks-list__heading bg-base-200 sticky top-0 text-center text-2xl font-bold select-none">
        {title} Tasks
      </h2>

      {category !== "uncategorised" && location.pathname === "/tasks" && (
        <>
          {inputShown ? (
            <button
              className="cancel-button btn btn-sm btn-soft text-primary-content btn-primary"
              onClick={() => setInputShown(!inputShown)}
            >
              Cancel
            </button>
          ) : (
            <button
              className="add-task-button btn btn-sm btn-soft text-primary-content btn-primary"
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
