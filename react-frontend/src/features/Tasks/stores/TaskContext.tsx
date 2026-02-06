import {
    createContext,
    type Dispatch,
    type PropsWithChildren,
    type SetStateAction,
    useContext,
    useMemo,
    useState,
} from "react";

type TasksType = {
    tasks: string[];
    setTasks: Dispatch<SetStateAction<string[]>>;
};

const TasksContext = createContext<TasksType | undefined>(undefined);

export const TasksProvider = ({ children }: PropsWithChildren) => {
    const [tasks, setTasks] = useState<string[]>([]);

    const contextValue: TasksType = useMemo({ tasks, setTasks }, [
        tasks,
        setTasks,
    ]);

    return (
        <TasksContext.Provider value={contextValue}>
            {children}
        </TasksContext.Provider>
    );
};

export const useTasksContext = () => {
    const tasksContext = useContext(TasksContext);

    if (!tasksContext) {
        throw new Error("useTasksContext must be used inside a TasksProvider");
    }

    return tasksContext;
};
