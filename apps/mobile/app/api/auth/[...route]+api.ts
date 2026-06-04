// biome-ignore-all lint/style/useFilenamingConvention: Expo Router API route naming

import { auth } from "@/lib/auth";

const handler = auth.handler;

export { handler as GET, handler as POST };
