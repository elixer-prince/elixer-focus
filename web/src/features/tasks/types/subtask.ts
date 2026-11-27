export type Subtask = {
  id: string;
  taskId: string;
  parentSubtaskId: string | null;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: number;
  updatedAt: number;
};
