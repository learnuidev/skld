"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Calendar } from "lucide-react";
import { ccCourse } from "./cc-course";
import { cn } from "@/lib/utils";

const PREVIOUS_ATTEMPTS_OPTIONS = [1, 2, 3];

export default function GoalsPage() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [currentStep, setCurrentStep] = useState(0);

  const [answers, setAnswers] = useState({
    isFirstTime: null as boolean | null,
    examDate: "",
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
    value: string | boolean | string[] | number | null,
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

  const handleSubmit = () => {
    console.log("Goal submitted:", { courseId, answers });
    window.location.href = "/dashboard";
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
                      <span className="text-base">
                        {domain.domainNumber}. {domain.title}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-gray-900" />
                      )}
                    </Button>
                  );
                })}
                {currentQuestion.id === "excelledDomains" &&
                  answers.excelledDomains.length > 0 && (
                    <div className="pt-4">
                      <Button
                        onClick={handleBack}
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
                        onClick={handleBack}
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
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={answers.examDate}
                    onChange={(e) => handleAnswer("examDate", e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-lg focus:border-gray-900 focus:outline-none"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
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

        <div className="mt-12 flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="text-gray-600 hover:text-gray-900 hover:bg-transparent px-0"
          >
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
}
