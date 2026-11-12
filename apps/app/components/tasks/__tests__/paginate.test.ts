import { describe, expect, it } from "vitest";
import { paginate } from "../paginate";

type FakeTask = { id: number; status: "todo" | "completed" };

const ITEMS_PER_PAGE = 10;

const makeTasks = (amount: number): FakeTask[] =>
  Array.from({ length: amount }, (_, i) => ({ id: i + 1, status: "todo" }));

describe("paginate", () => {
  it("returns the requested page when it exists", () => {
    const result = paginate(makeTasks(11), 2, ITEMS_PER_PAGE);

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.pageItems.map((t) => t.id)).toEqual([11]);
  });

  it("falls back to the last page after deleting the only item of the last page", () => {
    const tasks = makeTasks(11);
    const afterDelete = tasks.filter((t) => t.id !== 11);

    const result = paginate(afterDelete, 2, ITEMS_PER_PAGE);

    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.pageItems).toHaveLength(10);
  });

  it("falls back to the last page when a status change drops items out of the active filter", () => {
    const tasks = makeTasks(11);
    const todoFilter = (list: FakeTask[]) =>
      list.filter((t) => t.status === "todo");
    const afterStatusChange = tasks.map((t) =>
      t.id === 11 ? { ...t, status: "completed" as const } : t
    );

    const result = paginate(todoFilter(afterStatusChange), 2, ITEMS_PER_PAGE);

    expect(result.page).toBe(1);
    expect(result.pageItems).toHaveLength(10);
  });

  it("stays on page 1 with an empty list", () => {
    const result = paginate([], 3, ITEMS_PER_PAGE);

    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(0);
    expect(result.pageItems).toEqual([]);
  });

  it("clamps pages below 1", () => {
    const result = paginate(makeTasks(5), 0, ITEMS_PER_PAGE);

    expect(result.page).toBe(1);
    expect(result.pageItems).toHaveLength(5);
  });
});
