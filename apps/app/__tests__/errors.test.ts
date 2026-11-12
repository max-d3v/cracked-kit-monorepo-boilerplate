import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { showErrorToast, showSuccessToast } from "@/lib/errors";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

const zodErrorFor = (schema: z.ZodType, value: unknown) => {
  const result = schema.safeParse(value);
  if (result.success) {
    throw new Error("Expected the value to be invalid");
  }
  return result.error;
};

describe("showErrorToast", () => {
  it("prefixes validation errors with the failing field", () => {
    const error = zodErrorFor(z.object({ title: z.string().min(1) }), {
      title: "",
    });

    showErrorToast(error);

    expect(toast.error).toHaveBeenCalledWith("Error", {
      description: `title: ${error.issues[0]?.message}`,
    });
  });

  it("shows root-level validation errors without a field prefix", () => {
    const error = zodErrorFor(z.string(), 42);

    showErrorToast(error);

    expect(toast.error).toHaveBeenCalledWith("Error", {
      description: error.issues[0]?.message,
    });
  });

  it.each([
    ["an Error", new Error("Task not found"), "Task not found"],
    ["a string", "Something broke", "Something broke"],
    ["an object with a message", { message: "From the API" }, "From the API"],
    ["anything else", 42, "An unexpected error occurred"],
    ["null", null, "An unexpected error occurred"],
  ])("extracts a message from %s", (_label, error, expected) => {
    showErrorToast(error);

    expect(toast.error).toHaveBeenCalledWith("Error", {
      description: expected,
    });
  });

  it("uses a custom title", () => {
    showErrorToast(new Error("boom"), "Could not save task");

    expect(toast.error).toHaveBeenCalledWith("Could not save task", {
      description: "boom",
    });
  });
});

describe("showSuccessToast", () => {
  it("shows the message and optional description", () => {
    showSuccessToast("Task created", "It is now in your list");

    expect(toast.success).toHaveBeenCalledWith("Task created", {
      description: "It is now in your list",
    });
  });
});
