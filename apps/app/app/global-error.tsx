"use client";

import "@workspace/ui/globals.css";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { OrionLogo } from "@workspace/ui/components/orion-logo";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

type GlobalErrorProps = {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
          <OrionLogo size="lg" />

          <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle
                  aria-hidden="true"
                  className="h-5 w-5 text-destructive"
                />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred and the application could not
                recover. Our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="break-words font-mono text-muted-foreground text-sm">
                  {error.message || "Unknown error"}
                </p>
                {error.digest && (
                  <p className="mt-2 font-mono text-muted-foreground text-xs">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button className="flex-1" onClick={reset} type="button">
                  <RefreshCcw aria-hidden="true" />
                  Try again
                </Button>
                <Button
                  asChild
                  className="flex-1"
                  type="button"
                  variant="outline"
                >
                  <a href="/">
                    <Home aria-hidden="true" />
                    Go home
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
