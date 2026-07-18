import { z } from "zod";

const isBuild = typeof process !== "undefined" && (
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.CI === "true" ||
  process.env.NODE_ENV === "test"
);

const defaultDbUrl = isBuild ? "postgresql://placeholder:placeholder@placeholder.com/placeholder" : undefined;
const defaultClerkKey = isBuild ? "sk_test_placeholder" : undefined;
const defaultClerkPub = isBuild ? "pk_test_placeholder" : undefined;

const serverSchema = z.object({
  DATABASE_URL: z.string().default(defaultDbUrl || ""),
  CLERK_SECRET_KEY: z.string().default(defaultClerkKey || ""),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().default(defaultClerkPub || ""),
  APP_TIMEZONE: z.string().default("Asia/Kolkata"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().default(defaultClerkPub || ""),
});

let validatedServerEnv: z.infer<typeof serverSchema>;
let validatedClientEnv: z.infer<typeof clientSchema>;

export function getServerEnv() {
  if (typeof window !== "undefined") {
    throw new Error("getServerEnv cannot be called on the client side");
  }

  if (validatedServerEnv) {
    return {
      ...validatedServerEnv,
      timezone: validatedServerEnv.APP_TIMEZONE,
    };
  }

  const result = serverSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    APP_TIMEZONE: process.env.APP_TIMEZONE,
  });

  if (!result.success) {
    const errorDetails = JSON.stringify(result.error.format(), null, 2);
    console.error("❌ Server Environment configuration validation failed:\n", errorDetails);
    throw new Error(`Server environment validation failed. Check your environment variables:\n${errorDetails}`);
  }

  const data = result.data;
  if (!isBuild) {
    if (!data.DATABASE_URL) throw new Error("DATABASE_URL env variable is missing.");
    if (!data.CLERK_SECRET_KEY) throw new Error("CLERK_SECRET_KEY env variable is missing.");
    if (!data.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) throw new Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env variable is missing.");
  }

  validatedServerEnv = data;
  return {
    ...validatedServerEnv,
    timezone: validatedServerEnv.APP_TIMEZONE,
  };
}

export function getClientEnv() {
  if (validatedClientEnv) return validatedClientEnv;

  const result = clientSchema.safeParse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });

  if (!result.success) {
    const errorDetails = JSON.stringify(result.error.format(), null, 2);
    console.error("❌ Client Environment configuration validation failed:\n", errorDetails);
    throw new Error(`Client environment validation failed:\n${errorDetails}`);
  }

  const data = result.data;
  if (!isBuild && !data.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    throw new Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing on client environment.");
  }

  validatedClientEnv = data;
  return validatedClientEnv;
}
