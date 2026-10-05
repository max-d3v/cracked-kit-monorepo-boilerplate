import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const keys = () =>
  createEnv({
    client: {
      NEXT_PUBLIC_APP_URL: z.string().includes("http://"),
    },
    runtimeEnv: {
      NEXT_PUBLIC_APP_URL: process.env.DATABASE_URL,
    },
  });
