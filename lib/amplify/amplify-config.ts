import type { ResourcesConfig } from "aws-amplify";

export const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || "",
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_WEB_CLIENT_ID || "",
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
