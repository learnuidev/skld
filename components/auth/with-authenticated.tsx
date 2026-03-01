import { getIsAuthenticated } from "@/modules/auth/server-auth";
import { AuthFlow } from "@/components/auth/auth-flow";

export const WithAuthenticated = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = await getIsAuthenticated();

  if (!auth) {
    return <AuthFlow />;
  }

  return children;
};
