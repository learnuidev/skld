import { getIsAuthenticated } from "@/modules/auth/server-auth";

export const WithAuthenticated = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = await getIsAuthenticated();

  if (!auth) {
    return <div> You need to login</div>;
  }

  return children;
};
