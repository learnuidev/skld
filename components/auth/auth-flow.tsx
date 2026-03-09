"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { ConfirmSignupForm } from "@/components/auth/confirm-signup-form";

type AuthView = "login" | "signup" | "confirm";

export function AuthFlow() {
  const [view, setView] = useState<AuthView>("login");
  const [signupEmail, setSignupEmail] = useState("");

  const handleSignupSuccess = (data: { email: string }) => {
    setSignupEmail(data.email);
    setView("confirm");
  };

  const handleConfirmSuccess = () => {
    setView("login");
  };

  const handleLoginSuccess = () => {
    window.location.href = "/courses";
  };

  switch (view) {
    case "signup":
      return (
        <SignupForm
          onSuccess={handleSignupSuccess}
          onLoginClick={() => setView("login")}
        />
      );
    case "confirm":
      return (
        <ConfirmSignupForm
          email={signupEmail}
          onSuccess={handleConfirmSuccess}
        />
      );
    case "login":
    default:
      return (
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSignupClick={() => setView("signup")}
        />
      );
  }
}
