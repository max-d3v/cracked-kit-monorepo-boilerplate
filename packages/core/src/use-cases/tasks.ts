import { EVENTS } from "@workspace/analytics/events";
import { capture } from "@workspace/analytics/server";
import {
  create,
  deleteOne,
  listAllByUserId,
  updateOne,
} from "@workspace/repository/entities/tasks";
import type { TaskRawObject } from "@workspace/types/repository/tasks";
import type {
  CompleteTask,
  CreateTask,
  DeleteTask,
  GetUserTasksInput,
  UpdateTask,
} from "@workspace/types/use-cases/tasks";

const countTasksByStatus = (tasks: TaskRawObject[]) => ({
  completed: tasks.filter((t) => t.status === "completed").length,
  inProgress: tasks.filter((t) => t.status === "in-progress").length,
  todo: tasks.filter((t) => t.status === "todo").length,
});

// The tasks screens paginate on the client, so they need the full list
// rather than the repository's default page.
export const getUserTasks = async (params: GetUserTasksInput) => {
  const { userId } = params;
  return await listAllByUserId({ userId });
};

export const getUserTasksWithCount = async (params: GetUserTasksInput) => {
  const { userId } = params;

  // Counted from the same list so the counters always match `tasks`.
  // Move counting into SQL once pagination moves to the server.
  const tasks = await listAllByUserId({ userId });
  const taskCounts = countTasksByStatus(tasks);
  return { tasks, taskCounts };
};

export const createTask = async (params: CreateTask) => {
  const { userId, title, description } = params;

  capture({
    event: EVENTS.task_created,
    userId,
    details: {
      title,
      description,
    },
  });

  return await create({
    userId,
    title,
    description: description ?? null,
    status: "todo",
  });
};

export const completeTask = async (params: CompleteTask) => {
  const { userId, taskId } = params;

  capture({
    event: EVENTS.task_completed,
    userId,
    details: {
      taskId,
    },
  });

  return await updateOne({ id: taskId, userId, status: "completed" });
};

export const updateTask = async (params: UpdateTask) => {
  const { userId, taskId, data } = params;

  return await updateOne({ id: taskId, userId, ...data });
};

export const deleteTask = async (params: DeleteTask) => {
  const { userId, taskId } = params;

  return await deleteOne({ id: taskId, userId });
};
