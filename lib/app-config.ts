import { z } from "zod";

const appConfigSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().min(1, "API URL is required"),
});

const validateConfig = appConfigSchema.safeParse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_USER_POOL_ID,
});

if (!validateConfig.success) {
  const errors = validateConfig.error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
  throw new Error(`App configuration validation failed: ${errors}`);
}

export const appConfig = validateConfig.data;
