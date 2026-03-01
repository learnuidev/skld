"use client";

import { useMutation } from "@tanstack/react-query";
import { confirmSignUp } from "@aws-amplify/auth";

interface ConfirmSignupParams {
  email: string;
  confirmationCode: string;
}

interface ConfirmSignupResponse {
  isSignUpComplete: boolean;
  nextStep?: {
    signUpStep: string;
  };
}

export function useConfirmSignupMutation() {
  return useMutation({
    mutationFn: async ({
      email,
      confirmationCode,
    }: ConfirmSignupParams): Promise<ConfirmSignupResponse> => {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode,
      });

      return {
        isSignUpComplete,
        nextStep: nextStep as ConfirmSignupResponse["nextStep"],
      };
    },
  });
}
