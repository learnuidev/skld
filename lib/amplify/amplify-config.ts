import type { ResourcesConfig } from "aws-amplify";
import { z } from "zod";

const amplifyConfigSchema = z.object({
  NEXT_PUBLIC_USER_POOL_ID: z.string().min(1, "userPoolId is required"),
  NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID: z
    .string()
    .min(1, "webClientId is required"),
  NEXT_PUBLIC_AWS_REGION: z.string().optional(),
});

const validateConfig = amplifyConfigSchema.safeParse({
  NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID,
  NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID:
    process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID,
  NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
});

if (!validateConfig.success) {
  const errors = validateConfig.error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
  throw new Error(`Amplify configuration validation failed: ${errors}`);
}

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: validateConfig.data.NEXT_PUBLIC_USER_POOL_ID,
      userPoolClientId: validateConfig.data.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID,
      loginWith: {
        email: true,
      },
    },
  },
};
