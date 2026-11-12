import { describe, expect, it } from "vitest";
import { HttpError } from "../src/errors/http";

describe("HttpError", () => {
  it("carries the status code and message", () => {
    const error = new HttpError(404, "Task not found");

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Task not found");
    expect(error.details).toBeUndefined();
  });

  it("keeps optional details", () => {
    const details = { field: "title" };
    const error = new HttpError(400, "Invalid input", details);

    expect(error.details).toBe(details);
  });

  it("is a real Error so it can be thrown and caught generically", () => {
    const error = new HttpError(500, "Boom");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HttpError);
    expect(error.stack).toBeDefined();
    expect(() => {
      throw error;
    }).toThrow("Boom");
  });
});
