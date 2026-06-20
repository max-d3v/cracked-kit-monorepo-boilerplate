import { auth } from "@workspace/auth/auth";
import { toNextJsHandler } from "@workspace/auth/server";
import { withRouteErrorHandling } from "@/lib/route-error-handler";

const handlers = toNextJsHandler(auth);

export const GET = withRouteErrorHandling(handlers.GET, {
  route: "/api/auth/[...all]",
  tags: {
    route_kind: "auth",
  },
});

export const POST = withRouteErrorHandling(handlers.POST, {
  route: "/api/auth/[...all]",
  tags: {
    route_kind: "auth",
  },
});
