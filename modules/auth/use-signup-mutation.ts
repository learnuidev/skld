"use client";

import { useMutation } from "@tanstack/react-query";
import { signUp } from "@aws-amplify/auth";

interface SignupParams {
  email: string;
  password: string;
}

interface SignupResponse {
  isSignUpComplete: boolean;
  userId?: string;
  nextStep?: {
    signUpStep: string;
    codeDeliveryDetails?: {
      destination: string;
      deliveryMedium: string;
      attributeName: string;
    };
  };
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: SignupParams): Promise<SignupResponse> => {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
          },
        },
      });

      return {
        isSignUpComplete,
        userId,
        nextStep: nextStep as SignupResponse["nextStep"],
      };
    },
  });
}
