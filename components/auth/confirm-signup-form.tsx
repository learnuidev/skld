"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";
import { useConfirmSignupMutation } from "@/modules/auth/use-confirm-signup-mutation";
import { confirmSignupSchema } from "@/modules/auth/auth.schema";
import { cn } from "@/lib/utils";

interface ConfirmSignupFormProps {
  email: string;
  onSuccess: () => void;
}

export function ConfirmSignupForm({
  email,
  onSuccess,
}: ConfirmSignupFormProps) {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [error, setError] = useState<string>("");

  const confirmMutation = useConfirmSignupMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationCode(e.target.value);
    setError("");
  };

  const handleSubmit = async () => {
    try {
      const data = confirmSignupSchema.parse({ email, confirmationCode });
      await confirmMutation.mutateAsync(data);
      onSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid confirmation code");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const isLoading = confirmMutation.isPending;

  const errorMessage = confirmMutation.error?.message;

  const displayedError = error || errorMessage;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-8 py-16 md:py-24">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-0.5 bg-gray-200 rounded-full">
              <motion.div
                className="h-full bg-gray-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-sm font-medium text-gray-500">
              Final step
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-gray-400">
                <Mail className="h-6 w-6" />
                <span className="text-sm uppercase tracking-wide">
                  Verify your email
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-normal text-gray-900">
                  Enter the code sent to your email
                </h1>
                <p className="text-gray-600">
                  We sent a 6-digit code to verify your account for email{" "}
                  <span className="font-medium">{email}</span>
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={confirmationCode}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="000000"
                  disabled={isLoading}
                  className={cn(
                    "w-full px-6 py-4 text-lg text-center font-mono tracking-[0.5em] border-2 rounded-lg focus:outline-none transition-colors",
                    displayedError
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-gray-900",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  autoFocus
                />

                {displayedError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm"
                  >
                    {displayedError}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleSubmit}
                disabled={confirmationCode.length !== 6 || isLoading}
                className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
