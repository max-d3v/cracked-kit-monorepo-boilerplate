import { captureException } from "@workspace/observability/server";
import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";

type RouteHandler<Context = unknown> = (
  request: Request,
  context: Context
) => Response | Promise<Response>;

type ErrorResponse = {
  body: unknown;
  status: number;
};

type RouteErrorHandlingOptions = {
  getErrorResponse?: (error: unknown) => ErrorResponse;
  isExpectedError?: (error: unknown) => boolean;
  route: string;
  tags?: Record<string, string>;
};

function defaultErrorResponse(error: unknown): ErrorResponse {
  return {
    body: {
      error: error instanceof Error ? error.message : "Unexpected route error",
    },
    status: 500,
  };
}

export function withRouteErrorHandling<Context = unknown>(
  handler: RouteHandler<Context>,
  options: RouteErrorHandlingOptions
): RouteHandler<Context> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      unstable_rethrow(error);

      const { body, status } =
        options.getErrorResponse?.(error) ?? defaultErrorResponse(error);
      const isExpected = options.isExpectedError?.(error) ?? status < 500;

      if (status >= 500 && !isExpected) {
        captureException(error, {
          tags: {
            boundary: "route-handler",
            route: options.route,
            ...options.tags,
          },
          extra: {
            method: request.method,
            url: request.url,
          },
        });
      }

      return NextResponse.json(body, { status });
    }
  };
}
