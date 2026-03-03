"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetMockExamQuery } from "@/modules/user-mock-exams/use-get-mock-exam-query";
import { useUpdateMockExamMutation } from "@/modules/user-mock-exams/use-update-mock-exam-mutation";
import { useGetExamBanksQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import {
  Check,
  Clock,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function MockExamPage() {
  const params = useParams<{ courseId: string; mockExamId: string }>();
  const router = useRouter();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedMultipleAnswers, setSelectedMultipleAnswers] = useState<
    Set<number>
  >(new Set());
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { data: course } = useGetCourseQuery(params.courseId);
  const { data: mockExam, isLoading: mockExamLoading } = useGetMockExamQuery(
    params.mockExamId
  );
  const updateMockExamMutation = useUpdateMockExamMutation(params.mockExamId);
  const { data: examBanks } = useGetExamBanksQuery(params.courseId);

  const isLoading = mockExamLoading;

  const allowSkip = course?.exam?.allowSkipQuestions ?? false;
  const isTimed = mockExam?.examType === "timed";

  const getAllQuestions = () => {
    if (!examBanks || !mockExam) return [];

    let allQuestions = examBanks.flatMap((bank) => bank.questions);

    if (mockExam.selectedDomains && mockExam.selectedDomains.length > 0) {
      allQuestions = allQuestions.filter((question) =>
        mockExam.selectedDomains.includes(question.domainId)
      );
    }

    return allQuestions;
  };

  const allQuestions = getAllQuestions();
  const currentIndex = mockExam?.currentQuestionIndex ?? 0;
  const currentQuestion = allQuestions[currentIndex];
  const currentQuestionNumber = currentIndex + 1;
  const totalQuestions = allQuestions.length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!mockExam || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">Exam not found</div>
      </div>
    );
  }

  if (mockExam.status !== "in_progress") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">
          This exam has been{" "}
          {mockExam.status === "completed" ? "completed" : "abandoned"}
        </div>
      </div>
    );
  }

  if (!currentQuestion || totalQuestions === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">No questions available</div>
      </div>
    );
  }

  const handleAnswerChange = (answerIndex: number) => {
    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      setSelectedAnswer(answerIndex);
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      const newSelected = new Set(selectedMultipleAnswers);
      if (newSelected.has(answerIndex)) {
        newSelected.delete(answerIndex);
      } else {
        newSelected.add(answerIndex);
      }
      setSelectedMultipleAnswers(newSelected);
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      setTrueFalseAnswer(answerIndex === 0);
    }
  };

  const handleNext = async () => {
    const newAnswers = { ...mockExam.answers };
    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[currentQuestionNumber] = { answer: selectedAnswer };
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[currentQuestionNumber] = {
        answers: Array.from(selectedMultipleAnswers),
      };
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      newAnswers[currentQuestionNumber] = { answer: trueFalseAnswer };
    }

    const newTimeSpent = elapsedTime;
    const newTimeRemaining =
      isTimed && mockExam.timeRemaining
        ? mockExam.timeRemaining - newTimeSpent || 0
        : undefined;

    await updateMockExamMutation.mutateAsync({
      currentQuestionIndex: currentIndex + 1,
      answers: newAnswers,
      timeSpent: newTimeSpent,
      timeRemaining: newTimeRemaining,
    });

    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
    setElapsedTime(0);
  };

  const handleSkip = async () => {
    if (!allowSkip) return;

    const newTimeSpent = elapsedTime;
    const newTimeRemaining =
      isTimed && mockExam.timeRemaining
        ? mockExam.timeRemaining - newTimeSpent || 0
        : undefined;

    await updateMockExamMutation.mutateAsync({
      currentQuestionIndex: currentIndex + 1,
      timeSpent: newTimeSpent,
      timeRemaining: newTimeRemaining,
    });

    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
    setElapsedTime(0);
  };

  const handlePrevious = () => {
    setSelectedAnswer(null);
    setSelectedMultipleAnswers(new Set());
    setTrueFalseAnswer(null);
    setElapsedTime(0);
  };

  const handleSubmit = async () => {
    const newAnswers = { ...mockExam.answers };
    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[currentQuestionNumber] = { answer: selectedAnswer };
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      newAnswers[currentQuestionNumber] = {
        answers: Array.from(selectedMultipleAnswers),
      };
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      newAnswers[currentQuestionNumber] = { answer: trueFalseAnswer };
    }

    await updateMockExamMutation.mutateAsync({
      answers: newAnswers,
      status: "completed",
    });

    router.push(`/courses/${params.courseId}`);
  };

  const canGoNext = () => {
    if (currentQuestion?.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      return selectedAnswer !== null;
    } else if (currentQuestion?.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      return selectedMultipleAnswers.size > 0;
    } else if (currentQuestion?.type === "TRUE_FALSE") {
      return trueFalseAnswer !== null;
    }
    return false;
  };

  const getRemainingTime = () => {
    if (!isTimed || !mockExam.timeRemaining) return null;
    const remaining = mockExam.timeRemaining - elapsedTime;
    return remaining > 0 ? remaining : 0;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="mx-auto w-full py-12 flex-1">
        <header className="mb-12">
          <div className="flex items-baseline gap-4 justify-between mb-4">
            <Link
              href={`/courses/${params.courseId}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Link>

            <span className="text-muted-foreground text-lg">
              {currentQuestionNumber}{" "}
              <span className="text-sm">/ {totalQuestions}</span>
            </span>

            {isTimed && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="font-medium">
                  {formatTime(getRemainingTime() || 0)}
                </span>
              </div>
            )}
          </div>
        </header>

        <div className="mb-20">
          <div className="h-px w-full bg-border" />
          <div
            className="h-px bg-foreground transition-all duration-300"
            style={{
              width: `${(currentQuestionNumber / totalQuestions) * 100}%`,
            }}
          />
        </div>

        <div className="mb-16">
          <p className="text-xl text-foreground leading-relaxed mb-16">
            {currentQuestion.question}
          </p>

          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => {
              const isSelected =
                currentQuestion.type === "SINGLE_SELECT_MULTIPLE_CHOICE"
                  ? selectedAnswer === index
                  : currentQuestion.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE"
                    ? selectedMultipleAnswers.has(index)
                    : currentQuestion.type === "TRUE_FALSE"
                      ? (index === 0 && trueFalseAnswer === true) ||
                        (index === 1 && trueFalseAnswer === false)
                      : false;

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(index)}
                  className={`w-full text-left p-6 rounded-lg border-2 transition-all text-base ${
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-6 h-6 rounded bg-secondary/50 text-xs font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span>{option}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mt-12">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-3">
            {allowSkip && (
              <button
                onClick={handleSkip}
                disabled={updateMockExamMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Skip
              </button>
            )}

            {currentQuestionNumber === totalQuestions ? (
              <button
                onClick={handleSubmit}
                disabled={!canGoNext() || updateMockExamMutation.isPending}
                className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4" />
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canGoNext() || updateMockExamMutation.isPending}
                className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
