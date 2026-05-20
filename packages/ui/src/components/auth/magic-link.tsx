"use client";

import {
  type MagicLinkAuthClient,
  useAuth,
  useSignInMagicLink,
} from "@better-auth-ui/react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { type SyntheticEvent, useState } from "react";
import { toast } from "sonner";
import { MagicLinkButton } from "./magic-link-button";
import { PasskeyButton } from "./passkey-button";
import { ProviderButtons, type SocialLayout } from "./provider-buttons";

export type MagicLinkProps = {
  className?: string;
  socialLayout?: SocialLayout;
  socialPosition?: "top" | "bottom";
};

/**
 * Render a card-based sign-in form that sends an email magic link and optionally shows social provider buttons.
 *
 * @param className - Additional CSS class names applied to the card container
 * @param socialLayout - Layout style for social provider buttons
 * @param socialPosition - Position of social provider buttons; `"top"` or `"bottom"`. Defaults to `"bottom"`.
 * @returns The magic-link sign-in UI as a JSX element
 */
export function MagicLink({
  className,
  socialLayout,
  socialPosition = "bottom",
}: MagicLinkProps) {
  const {
    authClient,
    basePaths,
    baseURL,
    localization,
    passkey,
    redirectTo,
    socialProviders,
    viewPaths,
    Link,
  } = useAuth();

  const [email, setEmail] = useState("");

  const { mutate: signInMagicLink, isPending: magicLinkPending } =
    useSignInMagicLink(authClient as MagicLinkAuthClient, {
      onSuccess: () => {
        setEmail("");
        toast.success(localization.auth.magicLinkSent);
      },
    });

  const isPending = magicLinkPending;

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
  }>({});

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    signInMagicLink({ email, callbackURL: `${baseURL}${redirectTo}` });
  };

  const showSeparator = socialProviders && socialProviders.length > 0;

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardHeader>
        <CardTitle className="text-xl">{localization.auth.signIn}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-6">
          {socialPosition === "top" && (
            <>
              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  isPending={isPending}
                  socialLayout={socialLayout}
                />
              )}

              {showSeparator && (
                <FieldSeparator className="m-0 flex items-center text-xs *:data-[slot=field-separator-content]:bg-card">
                  {localization.auth.or}
                </FieldSeparator>
              )}
            </>
          )}

          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field data-invalid={!!fieldErrors.email}>
                <Label htmlFor="email">{localization.auth.email}</Label>

                <Input
                  aria-invalid={!!fieldErrors.email}
                  autoComplete="email"
                  disabled={isPending}
                  id="email"
                  name="email"
                  onChange={(e) => {
                    setEmail(e.target.value);

                    setFieldErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }));
                  }}
                  onInvalid={(e) => {
                    e.preventDefault();

                    setFieldErrors((prev) => ({
                      ...prev,
                      email: (e.target as HTMLInputElement).validationMessage,
                    }));
                  }}
                  placeholder={localization.auth.emailPlaceholder}
                  required
                  type="email"
                  value={email}
                />

                <FieldError>{fieldErrors.email}</FieldError>
              </Field>

              <div className="flex flex-col gap-3">
                <Button disabled={isPending} type="submit">
                  {isPending && <Spinner />}

                  {localization.auth.sendMagicLink}
                </Button>

                <MagicLinkButton isPending={isPending} view="magicLink" />

                {passkey && <PasskeyButton isPending={isPending} />}
              </div>
            </FieldGroup>
          </form>

          {socialPosition === "bottom" && (
            <>
              {showSeparator && (
                <FieldSeparator className="flex items-center text-xs *:data-[slot=field-separator-content]:bg-card">
                  {localization.auth.or}
                </FieldSeparator>
              )}

              {socialProviders && socialProviders.length > 0 && (
                <ProviderButtons
                  isPending={isPending}
                  socialLayout={socialLayout}
                />
              )}
            </>
          )}
        </div>

        <div className="mt-4 flex w-full flex-col items-center gap-3">
          <FieldDescription className="text-center">
            {localization.auth.needToCreateAnAccount}{" "}
            <Link
              className="underline underline-offset-4"
              href={`${basePaths.auth}/${viewPaths.auth.signUp}`}
            >
              {localization.auth.signUp}
            </Link>
          </FieldDescription>
        </div>
      </CardContent>
    </Card>
  );
}
