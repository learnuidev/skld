"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  FileText,
  ClipboardCheck,
  Check,
} from "lucide-react";

interface FormSidebarProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  totalSteps: number;
}

export function FormSidebar({
  currentStep,
  onStepChange,
  totalSteps,
}: FormSidebarProps) {
  const steps = [
    { id: 1, title: "Course Info", icon: BookOpen },
    { id: 2, title: "Domains", icon: Target },
    { id: 3, title: "Chapters", icon: FileText },
    { id: 4, title: "Exam", icon: ClipboardCheck },
    { id: 5, title: "Summary", icon: Check },
  ];

  const isStepAccessible = (step: number) => {
    if (step <= currentStep) return true;
    if (step === currentStep + 1) return true;
    return false;
  };

  const handleStepClick = (step: number) => {
    if (isStepAccessible(step)) {
      onStepChange(step);
    }
  };

  const isStepCompleted = (step: number) => {
    return step < currentStep;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[rgb(10,11,12)] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden sticky top-8"
    >
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Course Steps
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Navigate between sections
        </p>
      </div>

      <div className="p-6 space-y-2">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = isStepCompleted(step.id);
          const isAccessible = isStepAccessible(step.id);

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              disabled={!isAccessible}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                isActive
                  ? "bg-slate-100 dark:bg-slate-800"
                  : isCompleted
                    ? "bg-slate-50 dark:bg-[rgb(10,11,12)]/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                    : isAccessible
                      ? "bg-transparent hover:bg-slate-50 dark:hover:bg-[rgb(10,11,12)]/50"
                      : "bg-transparent opacity-40 cursor-not-allowed"
              }`}
            >
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[rgb(10,11,12)] dark:bg-white text-white dark:text-slate-900"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <step.icon className="w-4 h-4" />
                )}
              </span>
              <span
                className={`text-sm font-medium flex-1 ${
                  isActive
                    ? "text-slate-900 dark:text-white"
                    : isCompleted
                      ? "text-slate-600 dark:text-slate-400"
                      : "text-slate-500 dark:text-slate-500"
                }`}
              >
                {step.title}
              </span>
              {isAccessible && (
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Progress
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {currentStep}/{totalSteps}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-[rgb(10,11,12)] dark:bg-white rounded-full"
          />
        </div>

        {currentStep === totalSteps && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs font-medium text-green-800 dark:text-green-300 text-center">
              ✓ Ready to create!
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
