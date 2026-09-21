import { authMutationKeys, authQueryKeys } from "@better-auth-ui/core"
import {
  matchMutation,
  matchQuery,
  useQueryClient
} from "@tanstack/react-query"
import type { BetterFetchError } from "better-auth/react"
import { useEffect } from "react"
import { toast } from "sonner"

export function ErrorToaster() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const queryCache = queryClient.getQueryCache()
    const previousQueryOnError = queryCache.config.onError

    queryCache.config.onError = (error, query) => {
      // Auth errors are toasted here; everything else goes to the previous
      // handler. Delegating for auth errors too would double-toast, since the
      // app-level handler doesn't understand BetterFetchError.
      if (!matchQuery({ queryKey: authQueryKeys.all }, query)) {
        previousQueryOnError?.(error, query)
        return
      }

      const err = error as BetterFetchError
      if (err?.error?.code === "EMAIL_NOT_VERIFIED") return
      if (err?.error) {
        toast.error(err.error.message)
        return
      }
      previousQueryOnError?.(error, query)
    }

    const mutationCache = queryClient.getMutationCache()
    const previousMutationOnError = mutationCache.config.onError

    mutationCache.config.onError = (
      error,
      variables,
      onMutateResult,
      mutation,
      context
    ) => {
      if (!matchMutation({ mutationKey: authMutationKeys.all }, mutation)) {
        previousMutationOnError?.(
          error,
          variables,
          onMutateResult,
          mutation,
          context
        )
        return
      }

      const err = error as BetterFetchError
      if (err.error?.code === "EMAIL_NOT_VERIFIED") return
      toast.error(err.error?.message || err.message)
    }

    return () => {
      queryCache.config.onError = previousQueryOnError
      mutationCache.config.onError = previousMutationOnError
    }
  }, [queryClient])

  return null
}
