import { fetchAuthSession, getCurrentUser } from "@aws-amplify/auth";
import { AuthError } from "aws-amplify/auth";

export async function getAmplifyIsAuthenticated() {
  try {
    const authUser = await getCurrentUser();
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
    return await fetchAuthSession();
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
