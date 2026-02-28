import { useAddTask } from "@/features/tasks/stores/tasks-store";

const TaskHeader = () => {
  const addTask = useAddTask();

  return (
    <div>
      <h1 className="page-title mb-4 text-center text-4xl font-bold">
        My Tasks
      </h1>

      <input
        type="text"
        className="input input-primary placeholder:text-primary-content/75 border-primary-content/50 mx-auto block placeholder:italic"
        placeholder="Do the laundry..."
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            addTask(event.currentTarget.value);
            event.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
};

export default TaskHeader;
