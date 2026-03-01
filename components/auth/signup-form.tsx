"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useSignupMutation } from "@/modules/auth/use-signup-mutation";
import { signupSchema, type SignupInput } from "@/modules/auth/auth.schema";
import { cn } from "@/lib/utils";
import { z } from "zod";

export function SignupForm({
  onSuccess,
  onLoginClick,
}: {
  onSuccess: (data: { email: string }) => void;
  onLoginClick: () => void;
}) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupInput, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signupMutation = useSignupMutation();

  const steps = [
    {
      id: "email",
      question: "What's your email?",
      icon: Mail,
      placeholder: "Enter your email",
    },
    {
      id: "password",
      question: "Create a password",
      icon: Lock,
      placeholder: "Create a password",
    },
    {
      id: "confirmPassword",
      question: "Confirm your password",
      icon: Lock,
      placeholder: "Confirm your password",
    },
  ];

  const validateCurrentStep = () => {
    const currentStepId = steps[step].id as keyof SignupInput;
    const value = formData[currentStepId];

    if (!value) {
      setErrors((prev) => ({
        ...prev,
        [currentStepId]: "This field is required",
      }));
      return false;
    }

    if (currentStepId === "email") {
      const result = z
        .string()
        .email("Please enter a valid email address")
        .safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          [currentStepId]: result.error.issues[0].message,
        }));
        return false;
      }
    }

    if (currentStepId === "password") {
      const passwordSchema = z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be less than 100 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number");
      const result = passwordSchema.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          [currentStepId]: result.error.issues[0].message,
        }));
        return false;
      }
    }

    if (currentStepId === "confirmPassword") {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          [currentStepId]: "Passwords do not match",
        }));
        return false;
      }
    }

    setErrors({});
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      try {
        const result = signupSchema.parse(formData);
        await signupMutation.mutateAsync(result);
        onSuccess({ email: formData.email });
      } catch (error) {
        console.error("Signup error:", error);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNext();
    }
  };

  const currentStepData = steps[step];
  const Icon = currentStepData.icon;

  const isLoading = signupMutation.isPending;
  const isError = signupMutation.isError;
  const errorMessage =
    signupMutation.error instanceof Error
      ? signupMutation.error.message
      : "An error occurred during signup";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-8 py-16 md:py-24">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-0.5 bg-gray-200 rounded-full">
              <motion.div
                className="h-full bg-gray-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-sm font-medium text-gray-500">
              {step + 1}/{steps.length}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-gray-400">
                <Icon className="h-6 w-6" />
                <span className="text-sm uppercase tracking-wide">
                  Step {step + 1} of {steps.length}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-normal text-gray-900">
                {currentStepData.question}
              </h1>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type={
                      currentStepData.id === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : currentStepData.id === "confirmPassword"
                          ? showConfirmPassword
                            ? "text"
                            : "password"
                          : "text"
                    }
                    name={currentStepData.id}
                    value={
                      formData[currentStepData.id as keyof typeof formData]
                    }
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder={currentStepData.placeholder}
                    disabled={isLoading}
                    className={cn(
                      "w-full px-6 py-4 text-lg border-2 rounded-lg focus:outline-none transition-colors",
                      errors[currentStepData.id as keyof typeof formData]
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-gray-900",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      currentStepData.id.includes("password") && "pr-12"
                    )}
                    autoFocus
                  />

                  {currentStepData.id === "password" && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  )}

                  {currentStepData.id === "confirmPassword" && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>

                {errors[currentStepData.id as keyof typeof formData] && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm pl-2"
                  >
                    {errors[currentStepData.id as keyof typeof formData]}
                  </motion.p>
                )}

                {isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm"
                  >
                    {errorMessage}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleNext}
                disabled={
                  !formData[currentStepData.id as keyof typeof formData] ||
                  isLoading
                }
                className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isLoading
                  ? "Processing..."
                  : step === steps.length - 1
                    ? "Create Account"
                    : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {step > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="w-full text-gray-600 hover:text-gray-900 hover:bg-transparent disabled:opacity-50"
                >
                  ← Back
                </Button>
              )}

              {step === 0 && (
                <Button
                  variant="ghost"
                  onClick={onLoginClick}
                  disabled={isLoading}
                  className="w-full text-gray-600 hover:text-gray-900 hover:bg-transparent disabled:opacity-50"
                >
                  Already have an account? Log in
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
