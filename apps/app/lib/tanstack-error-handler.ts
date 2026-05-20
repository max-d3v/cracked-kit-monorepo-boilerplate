import { ORPCError } from "@orpc/server";
import { MutationCache, QueryCache } from "@tanstack/react-query";
import { HttpError } from "@workspace/types/errors/http";
import { toast } from "sonner";

/**
 * Optional `meta` fields read by the global cache handlers below. Pass them on
 * a `useQuery` / `useMutation` / `*.queryOptions` / `*.mutationOptions` call:
 *
 *   useMutation({ ...opts, meta: { silent: true } })
 *   useMutation({ ...opts, meta: { errorTitle: "Failed to invite member" } })
 */
type AppMeta = {
  /** Skip the global error toast — the caller renders its own error UI. */
  silent?: boolean;
  /** Title for the global error toast; the server message becomes the body. */
  errorTitle?: string;
};

/**
 * Return the ORPCError as-is. ORPC already transform errors i did not place explicitly as expected as 500s with generic messaes.
 *  Non-ORPC errors collapse to a generic 500
 * HttpError with a fixed "Unexpected error" message.
 */
function parseError(error: unknown): ORPCError<string, unknown> | HttpError {
  if (error instanceof ORPCError) {
    return error;
  }
  console.error(error);
  return new HttpError(500, "Unexpected error");
}

function readMeta(meta: unknown): AppMeta {
  if (typeof meta !== "object" || meta === null) {
    return {};
  }
  const record = meta as Record<string, unknown>;
  const errorTitle =
    typeof record.errorTitle === "string" && record.errorTitle.length > 0
      ? record.errorTitle
      : undefined;
  return { silent: record.silent === true, errorTitle };
}

function showErrorToast(message: string, errorTitle: string | undefined): void {
  if (errorTitle) {
    toast.error(errorTitle, { description: message });
  } else {
    toast.error(message);
  }
}

function surfaceError(error: unknown, meta: unknown): void {
  const { silent, errorTitle } = readMeta(meta);
  if (silent) {
    return;
  }
  const { message } = parseError(error);
  showErrorToast(message, errorTitle);
}

export function createAppQueryCache(): QueryCache {
  return new QueryCache({
    onError: (error, query) => {
      surfaceError(error, query.options.meta);
    },
  });
}

export function createAppMutationCache(): MutationCache {
  return new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      surfaceError(error, mutation.options.meta);
    },
  });
}
