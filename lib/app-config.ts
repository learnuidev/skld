import { z } from "zod";

const appConfigSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.url("API URL must be a valid URL"),
});

const validateConfig = appConfigSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

if (!validateConfig.success) {
  const errors = validateConfig.error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
  throw new Error(`App configuration validation failed: ${errors}`);
}

export const appConfig = validateConfig.data;
