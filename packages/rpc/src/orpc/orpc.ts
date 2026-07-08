import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { router } from "../router";

declare global {
  var $client: RouterClient<typeof router> | undefined;
}

const link = new RPCLink({
  url: () => {
    if (!("window" in globalThis)) {
      throw new Error("RPCLink is not allowed on the server side.");
    }

    // For the client side, we fetch from the API.
    return `${process.env.NEXT_PUBLIC_API_URL}/rpc`;
  },

  fetch: (request, init) =>
    globalThis.fetch(request, { ...init, credentials: "include" }),
});

/**
 * Fallback to client-side client if server-side client is not available.
 */
export const client: RouterClient<typeof router> =
  globalThis.$client ?? createORPCClient(link);
