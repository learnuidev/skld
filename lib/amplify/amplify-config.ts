import type { ResourcesConfig } from "aws-amplify";
import { z } from "zod";

const amplifyConfigSchema = z.object({
  NEXT_PUBLIC_USER_POOL_ID: z.string().min(1, "userPoolId is required"),
  NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID: z
    .string()
    .min(1, "webClientId is required"),
});

const validateConfig = amplifyConfigSchema.safeParse({
  NEXT_PUBLIC_USER_POOL_ID: process.env.NEXT_PUBLIC_USER_POOL_ID,
  NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID:
    process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID,
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
        username: true, // Adjust based on your sign-in mechanism (email/phone if needed)

        // oauth: {
        //   domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || "",
        //   redirectSignIn: [
        //     `${ssoRedirectHost}${process.env.NEXT_PUBLIC_AUTH_REDIRECT_SIGNIN}`,
        //   ],
        //   redirectSignOut: [
        //     `${ssoRedirectHost}${process.env.NEXT_PUBLIC_AUTH_REDIRECT_SIGNOUT}`,
        //   ],
        //   responseType: "code",
        //   scopes: [
        //     "aws.cognito.signin.user.admin",
        //     "email",
        //     "openid",
        //     "phone",
        //     "profile",
        //   ],
        // },
      },
    },
  },
  //   API: {
  //     GraphQL: {
  //       defaultAuthMode: "userPool",
  //       endpoint: process.env.NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT || "",
  //       region: process.env.NEXT_PUBLIC_APPSYNC_REGION || "",
  //     },
  //   },
};
