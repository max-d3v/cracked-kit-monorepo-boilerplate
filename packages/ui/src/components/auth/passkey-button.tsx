// @ts-nocheck
"use client";

import { useAuth, useSignInPasskey } from "@better-auth-ui/react";
import { Button } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { Fingerprint } from "lucide-react";

export type PasskeyButtonProps = {
  isPending: boolean;
};

export function PasskeyButton({ isPending }: PasskeyButtonProps) {
  const { localization, redirectTo, navigate } = useAuth();

  const { mutate: signInPasskey, isPending: passkeyPending } = useSignInPasskey(
    {
      onSuccess: () => navigate({ to: redirectTo }),
    }
  );

  const isDisabled = isPending || passkeyPending;

  return (
    <Button
      className={cn("w-full", isDisabled && "pointer-events-none opacity-50")}
      disabled={isDisabled}
      onClick={() => signInPasskey()}
      type="button"
      variant="outline"
    >
      {passkeyPending ? <Spinner /> : <Fingerprint />}
      {localization.auth.continueWith.replace(
        "{{provider}}",
        localization.auth.passkey
      )}
    </Button>
  );
}
