import { cookies } from "next/headers";
import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { fetchAuthSession, getCurrentUser } from "@aws-amplify/auth/server";
import { AuthError } from "aws-amplify/auth";

import { amplifyConfig } from "./amplify-config";

export const { runWithAmplifyServerContext } = createServerRunner({
  config: amplifyConfig,
});

export async function getAmplifyIsAuthenticated() {
  try {
    const authUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    return !!authUser;
  } catch (error) {
    if (
      !(
        error instanceof AuthError &&
        error.name === "UserUnAuthenticatedException"
      )
    ) {
      console.error(error);
    }
  }
  return false;
}

async function getAuthSession() {
  try {
    const authSession = runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });
    return authSession;
  } catch (error) {
    console.error(error);
  }
  return null;
}

export async function getAmplifyAuthToken() {
  const authToken = (await getAuthSession())?.tokens?.accessToken?.toString();
  if (authToken) {
    return authToken;
  } else {
    return null;
  }
}
