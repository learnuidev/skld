"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { ccCourse } from "./cc-course";
import { cn } from "@/lib/utils";

const PREVIOUS_ATTEMPTS_OPTIONS = [1, 2, 3];

export default function GoalsPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [currentStep, setCurrentStep] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  const [answers, setAnswers] = useState({
    isFirstTime: null as boolean | null,
    examDate: null as Date | null,
    previousAttempts: null as number | null,
    customPreviousAttempts: "",
    excelledDomains: [] as string[],
    struggledDomains: [] as string[],
  });

  useEffect(() => {
    if (courseId !== "cc") {
      window.location.href = "/";
    }
  }, [courseId]);

  const questions = [
    {
      id: "isFirstTime",
      question: "Is this your first time taking this exam?",
      type: "choice",
    },
    {
      id: "examDate",
      question: "When would you like to take the exam?",
      type: "date",
      visible: answers.isFirstTime === true,
    },
    {
      id: "previousAttempts",
      question: "How many times have you taken this exam?",
      type: "choice",
      visible: answers.isFirstTime === false,
    },
    {
      id: "excelledDomains",
      question: "What domains did you excel in?",
      type: "multi-select",
      visible: answers.isFirstTime === false,
    },
    {
      id: "struggledDomains",
      question: "What domains did you struggle with?",
      type: "multi-select",
      visible: answers.isFirstTime === false,
    },
    {
      id: "finalExamDate",
      question: "When would you like to take the exam?",
      type: "date",
      visible: answers.isFirstTime === false,
    },
  ].filter((q) => q.visible !== false);

  const visibleQuestions = questions;

  const handleAnswer = (
    questionId: string,
    value: string | boolean | string[] | number | Date | null,
  ) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const toggleDomain = (domainId: string, type: "excelled" | "struggled") => {
    setAnswers((prev) => {
      const key = type === "excelled" ? "excelledDomains" : "struggledDomains";
      const current = prev[key];
      const exists = current.includes(domainId);

      return {
        ...prev,
        [key]: exists
          ? current.filter((d) => d !== domainId)
          : [...current, domainId],
      };
    });
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmit = () => {
    setShowComplete(true);
  };

  const currentQuestion = visibleQuestions[currentStep];
  const isLastQuestion = currentStep === visibleQuestions.length - 1;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-8 py-16 md:py-24">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-0.5 bg-gray-200 rounded-full">
              <motion.div
                className="h-full bg-gray-900 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + 1) / visibleQuestions.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-sm font-medium text-gray-500">
              {currentStep + 1}/{visibleQuestions.length}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl md:text-4xl font-normal text-gray-900 mb-12">
              {currentQuestion.question}
            </h1>

            {currentQuestion.id === "isFirstTime" && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => handleAnswer("isFirstTime", true)}
                  className={cn(
                    "w-full justify-start text-left px-0 py-6 h-auto hover:bg-transparent",
                    answers.isFirstTime === true
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  <span className="text-lg">Yes, it&apos;s my first time</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleAnswer("isFirstTime", false)}
                  className={cn(
                    "w-full justify-start text-left px-0 py-6 h-auto hover:bg-transparent",
                    answers.isFirstTime === false
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  <span className="text-lg">No, I&apos;ve taken it before</span>
                </Button>
              </div>
            )}

            {currentQuestion.id === "previousAttempts" && (
              <div className="space-y-3">
                {PREVIOUS_ATTEMPTS_OPTIONS.map((num) => (
                  <Button
                    key={num}
                    variant="ghost"
                    onClick={() => handleAnswer("previousAttempts", num)}
                    className={cn(
                      "w-full justify-between text-left px-6 py-4 h-auto border rounded-lg hover:bg-gray-50",
                      answers.previousAttempts === num
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-900",
                    )}
                  >
                    <span>{num}</span>
                    {answers.previousAttempts === num && (
                      <CheckCircle2 className="h-5 w-5 text-gray-900" />
                    )}
                  </Button>
                ))}
                <input
                  type="number"
                  min="4"
                  value={answers.customPreviousAttempts}
                  onChange={(e) =>
                    setAnswers((prev) => ({
                      ...prev,
                      customPreviousAttempts: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && answers.customPreviousAttempts) {
                      handleAnswer(
                        "previousAttempts",
                        parseInt(answers.customPreviousAttempts),
                      );
                    }
                  }}
                  placeholder="Other"
                  className="w-full px-6 py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 text-lg"
                />
                <Button
                  onClick={() =>
                    answers.customPreviousAttempts &&
                    handleAnswer(
                      "previousAttempts",
                      parseInt(answers.customPreviousAttempts),
                    )
                  }
                  disabled={!answers.customPreviousAttempts}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800"
                  size="lg"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {(currentQuestion.id === "excelledDomains" ||
              currentQuestion.id === "struggledDomains") && (
              <div className="space-y-4">
                {ccCourse.domains.map((domain) => {
                  const isSelected =
                    currentQuestion.id === "excelledDomains"
                      ? answers.excelledDomains.includes(domain.id)
                      : answers.struggledDomains.includes(domain.id);

                  return (
                    <Button
                      key={domain.id}
                      variant="ghost"
                      onClick={() =>
                        toggleDomain(
                          domain.id,
                          currentQuestion.id === "excelledDomains"
                            ? "excelled"
                            : "struggled",
                        )
                      }
                      className={cn(
                        "w-full justify-between text-left px-6 py-4 h-auto border rounded-lg hover:bg-gray-50",
                        isSelected
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-900",
                      )}
                    >
                      <span className="text-base truncate pr-2">
                        {domain.domainNumber}. {domain.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-gray-900 flex-shrink-0" />
                      )}
                    </Button>
                  );
                })}
                {currentQuestion.id === "excelledDomains" &&
                  answers.excelledDomains.length > 0 && (
                    <div className="pt-4">
                      <Button
                        onClick={handleNext}
                        className="w-full bg-gray-900 text-white hover:bg-gray-800"
                        size="lg"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                {currentQuestion.id === "struggledDomains" &&
                  answers.struggledDomains.length > 0 && (
                    <div className="pt-4">
                      <Button
                        onClick={handleNext}
                        className="w-full bg-gray-900 text-white hover:bg-gray-800"
                        size="lg"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
              </div>
            )}

            {(currentQuestion.id === "examDate" ||
              currentQuestion.id === "finalExamDate") && (
              <div className="space-y-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left px-6 py-4 h-auto border rounded-lg hover:bg-gray-50",
                        !answers.examDate && "text-muted-foreground",
                      )}
                    >
                      {answers.examDate ? (
                        format(answers.examDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={answers.examDate || undefined}
                      onSelect={(date) => {
                        setAnswers((prev) => ({
                          ...prev,
                          examDate: date ?? null,
                        }));
                      }}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  onClick={
                    isLastQuestion
                      ? handleSubmit
                      : () => setCurrentStep((prev) => prev + 1)
                  }
                  disabled={!answers.examDate}
                  className="w-full bg-gray-900 text-white hover:bg-gray-800"
                  size="lg"
                >
                  {isLastQuestion ? "Complete" : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {showComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">Goal Complete!</h2>
            <pre className="bg-gray-100 p-6 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify({ courseId, answers }, null, 2)}
            </pre>
            <Button
              onClick={() => (window.location.href = "/dashboard")}
              className="w-full bg-gray-900 text-white hover:bg-gray-800"
              size="lg"
            >
              Continue to Dashboard
            </Button>
          </motion.div>
        )}

        <div className="mt-12 flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || showComplete}
            className="text-gray-600 hover:text-gray-900 hover:bg-transparent px-0"
          >
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
}
