"use client";

import { Amplify } from "aws-amplify";
import { amplifyConfig } from "@/lib/amplify/amplify-config";

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  Amplify.configure(amplifyConfig, {
    ssr: true,
  });

  return <>{children}</>;
}
