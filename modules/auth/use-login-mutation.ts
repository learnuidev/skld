"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn } from "@aws-amplify/auth";

interface LoginParams {
  email: string;
  password: string;
}

interface LoginResponse {
  isSignedIn: boolean;
  nextStep?: {
    signInStep: string;
  };
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: LoginParams): Promise<LoginResponse> => {
      const { isSignedIn, nextStep } = await signIn({
        username: email,
        password,
      });

      return {
        isSignedIn,
        nextStep: nextStep as LoginResponse["nextStep"],
      };
    },
  });
}
