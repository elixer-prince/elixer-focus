import type { Dispatch, SetStateAction } from "react";

interface ColumnHeaderProps {
  title: string;
  category: string;
  inputShown: boolean;
  setInputShown: Dispatch<SetStateAction<boolean>>;
}

const ColumnHeader = ({
  title,
  category,
  inputShown,
  setInputShown,
}: ColumnHeaderProps) => {
  return (
    <div className="tasks-container__header flex items-center justify-center gap-2 p-4">
      <h2 className="tasks-list__heading bg-base-200 sticky top-0 text-center text-2xl font-bold select-none">
        {title}
      </h2>

      {category !== "uncategorised" && (
        <button
          className="btn btn-sm btn-soft text-primary-content btn-primary"
          onClick={() => setInputShown(!inputShown)}
        >
          Add task
        </button>
      )}
    </div>
  );
};

export default ColumnHeader;
