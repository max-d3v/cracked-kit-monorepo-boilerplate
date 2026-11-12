import { EVENTS } from "@workspace/analytics/events";
import { capture } from "@workspace/analytics/server";
import {
  create,
  deleteOne,
  list,
  updateOne,
} from "@workspace/repository/entities/tasks";
import { HttpError } from "@workspace/types/errors/http";
import { describe, expect, it, vi } from "vitest";
import {
  completeTask,
  createTask,
  deleteTask,
  getUserTasks,
  getUserTasksWithCount,
  updateTask,
} from "../src/use-cases/tasks";
import { makeTask, TASK_ID, USER_ID } from "./fixtures";

vi.mock("@workspace/repository/entities/tasks", () => ({
  create: vi.fn(),
  deleteOne: vi.fn(),
  list: vi.fn(),
  updateOne: vi.fn(),
}));
vi.mock("@workspace/analytics/server", () => ({ capture: vi.fn() }));

/** `list` is typed with its optional relations; the use-cases only read task fields. */
type TaskList = Awaited<ReturnType<typeof list>>;

describe("getUserTasks", () => {
  it("lists only the given user's tasks", async () => {
    const tasks = [makeTask()];
    vi.mocked(list).mockResolvedValue(tasks as TaskList);

    await expect(getUserTasks({ userId: USER_ID })).resolves.toBe(tasks);
    expect(list).toHaveBeenCalledWith({ userId: USER_ID });
  });
});

describe("getUserTasksWithCount", () => {
  it("counts tasks per status", async () => {
    const tasks = [
      makeTask({ status: "todo" }),
      makeTask({ status: "todo" }),
      makeTask({ status: "in-progress" }),
      makeTask({ status: "completed" }),
      makeTask({ status: "cancelled" }),
    ];
    vi.mocked(list).mockResolvedValue(tasks as TaskList);

    const result = await getUserTasksWithCount({ userId: USER_ID });

    expect(result.tasks).toBe(tasks);
    expect(result.taskCounts).toEqual({ todo: 2, inProgress: 1, completed: 1 });
  });

  it("returns zero counts when the user has no tasks", async () => {
    vi.mocked(list).mockResolvedValue([]);

    const result = await getUserTasksWithCount({ userId: USER_ID });

    expect(result.taskCounts).toEqual({ todo: 0, inProgress: 0, completed: 0 });
  });
});

describe("createTask", () => {
  it("creates a todo task for the user and tracks the event", async () => {
    const created = makeTask({ description: "with vitest" });
    vi.mocked(create).mockResolvedValue(created);

    const result = await createTask({
      userId: USER_ID,
      title: "Write tests",
      description: "with vitest",
    });

    expect(result).toBe(created);
    expect(create).toHaveBeenCalledWith({
      userId: USER_ID,
      title: "Write tests",
      description: "with vitest",
      status: "todo",
    });
    expect(capture).toHaveBeenCalledWith({
      event: EVENTS.task_created,
      userId: USER_ID,
      details: { title: "Write tests", description: "with vitest" },
    });
  });

  it("stores a missing description as null", async () => {
    vi.mocked(create).mockResolvedValue(makeTask());

    await createTask({ userId: USER_ID, title: "Write tests" });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ description: null })
    );
  });
});

describe("completeTask", () => {
  it("marks the user's task as completed and tracks the event", async () => {
    const completed = makeTask({ status: "completed" });
    vi.mocked(updateOne).mockResolvedValue(completed);

    await expect(
      completeTask({ userId: USER_ID, taskId: TASK_ID })
    ).resolves.toBe(completed);
    expect(updateOne).toHaveBeenCalledWith({
      id: TASK_ID,
      userId: USER_ID,
      status: "completed",
    });
    expect(capture).toHaveBeenCalledWith({
      event: EVENTS.task_completed,
      userId: USER_ID,
      details: { taskId: TASK_ID },
    });
  });
});

describe("updateTask", () => {
  it("updates the task scoped to its owner", async () => {
    const updated = makeTask({ title: "Renamed", status: "in-progress" });
    vi.mocked(updateOne).mockResolvedValue(updated);

    const result = await updateTask({
      userId: USER_ID,
      taskId: TASK_ID,
      data: { title: "Renamed", status: "in-progress" },
    });

    expect(result).toBe(updated);
    expect(updateOne).toHaveBeenCalledWith({
      id: TASK_ID,
      userId: USER_ID,
      title: "Renamed",
      status: "in-progress",
    });
  });

  it("surfaces not-found errors from the repository", async () => {
    vi.mocked(updateOne).mockRejectedValue(
      new HttpError(404, "Task not found")
    );

    await expect(
      updateTask({ userId: USER_ID, taskId: TASK_ID, data: { title: "x" } })
    ).rejects.toMatchObject({ statusCode: 404, message: "Task not found" });
  });
});

describe("deleteTask", () => {
  it("deletes the task scoped to its owner", async () => {
    const deleted = makeTask();
    vi.mocked(deleteOne).mockResolvedValue(deleted);

    await expect(
      deleteTask({ userId: USER_ID, taskId: TASK_ID })
    ).resolves.toBe(deleted);
    expect(deleteOne).toHaveBeenCalledWith({ id: TASK_ID, userId: USER_ID });
  });
});
