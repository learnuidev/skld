import { getAmplifyIsAuthenticated } from "@/lib/amplify/server-auth-amplify";

export const getIsAuthenticated = async () => {
  const authUser = await getAmplifyIsAuthenticated();

  return authUser;
};
