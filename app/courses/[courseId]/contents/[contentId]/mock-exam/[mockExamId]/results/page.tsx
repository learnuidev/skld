"use client";

import type { Question } from "@/modules/exam-bank/exam-bank.types";
import { useGetExamBankQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useGetMockExamQuery } from "@/modules/user-mock-exams/use-get-mock-exam-query";
import { ArrowLeft, Check, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MockExam } from "@/modules/user-mock-exams/user-mock-exams.types";

type AnswerItem = number | string | boolean | null;

type AnswerValue = {
  questionId: string;
  answer?: AnswerItem;
  answers?: AnswerItem[];
  timeSpent: number;
  answeredAt: number;
};

function ContentQuizResults({
  mockExam,
  contentQuestions,
}: {
  mockExam: MockExam;
  contentQuestions: Question[];
}) {
  const params = useParams<{
    courseId: string;
    contentId: string;
    mockExamId: string;
  }>();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateOverallAccuracy = () => {
    let correct = 0;
    let total = 0;

    contentQuestions.forEach((question) => {
      const answer = (mockExam.answers || {})[question.id];
      if (!answer) return;

      total++;

      if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
        if (answer.answer === question.correctOptionIndex) {
          correct++;
        }
      } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
        const userAnswers = answer.answers || [];
        const correctAnswers = question.correctOptionIndexes || [];
        if (
          userAnswers.length === correctAnswers.length &&
          userAnswers.every(
            (ans: AnswerItem) =>
              typeof ans === "number" && correctAnswers.includes(ans)
          )
        ) {
          correct++;
        }
      } else if (question.type === "TRUE_FALSE") {
        if (answer.answer === (question.correctOptionIndex === 0)) {
          correct++;
        }
      }
    });

    if (total === 0) return null;
    return Math.round((correct / total) * 100);
  };

  const overallAccuracy = calculateOverallAccuracy();

  const getQuestionStatus = (
    question: Question,
    answer: AnswerValue | null
  ) => {
    if (!answer) return { status: "skipped", icon: null };

    let isCorrect = false;

    if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      isCorrect = answer.answer === question.correctOptionIndex;
    } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      const userAnswers = answer.answers || [];
      const correctAnswers = question.correctOptionIndexes || [];
      if (
        userAnswers.length === correctAnswers.length &&
        userAnswers.every(
          (ans: AnswerItem) =>
            typeof ans === "number" && correctAnswers.includes(ans)
        )
      ) {
        isCorrect = true;
      }
    } else if (question.type === "TRUE_FALSE") {
      isCorrect = answer.answer === (question.correctOptionIndex === 0);
    }

    return isCorrect
      ? { status: "correct", icon: Check }
      : { status: "incorrect", icon: XCircle };
  };

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const toggleAccordion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const sortedAnswers = useMemo(() => {
    return contentQuestions
      .filter((q) => (mockExam.answers || {})[q.id])
      .sort((a, b) => {
        const answerA = (mockExam.answers || {})[a.id];
        const answerB = (mockExam.answers || {})[b.id];
        return answerA?.answeredAt - answerB?.answeredAt;
      });
  }, [contentQuestions, mockExam.answers]);

  const questionsAnswered = Object.keys(mockExam.answers || {}).length;
  const totalQuestions = contentQuestions.length;
  const totalTimeSpent = Object.values(mockExam.answers || {}).reduce(
    (sum: number, ans: AnswerValue) => sum + (ans?.timeSpent || 0),
    0
  );

  let totalCorrect = 0;
  let totalIncorrect = 0;

  contentQuestions.forEach((question) => {
    const answer = (mockExam.answers || {})[question.id];
    if (!answer) return;

    const status = getQuestionStatus(question, answer);
    if (status.status === "correct") {
      totalCorrect++;
    } else if (status.status === "incorrect") {
      totalIncorrect++;
    }
  });

  return (
    <div className="min-h-screen flex justify-center bg-background py-12">
      <div className="w-full max-w-3xl">
        <div className="bg-white dark:bg-[rgb(10,11,12)] rounded-2xl border border-border shadow-lg p-8">
          <div className="mb-8">
            <Link
              href={`/courses/${params.courseId}/contents/${params.contentId}`}
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Content
            </Link>
          </div>

          <div className="mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Quiz Results
            </h1>
            <p className="text-muted-foreground text-lg">
              Content Quiz Completed
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">Correct</div>
              <div className="text-3xl font-bold text-green-600">
                {totalCorrect}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">Incorrect</div>
              <div className="text-3xl font-bold text-red-500">
                {totalIncorrect}
              </div>
            </div>
            {overallAccuracy !== null && (
              <div className="flex flex-col gap-2">
                <div className="text-sm text-muted-foreground">Accuracy</div>
                <div className="text-3xl font-bold text-foreground">
                  {overallAccuracy}%
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">
                Questions Answered
              </div>
              <div className="text-2xl font-bold text-foreground">
                {questionsAnswered}/{totalQuestions}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">
                Total Time Spent
              </div>
              <div className="text-2xl font-bold text-foreground">
                {formatTime(totalTimeSpent)}
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border mb-8" />

          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Question Breakdown
            </h2>

            <div className="space-y-3">
              {sortedAnswers.map((question, index) => {
                const answer = (mockExam.answers || {})[question.id];
                const status = getQuestionStatus(question, answer);
                const timeSpent = answer?.timeSpent || 0;

                return (
                  <div
                    key={question.id}
                    className="rounded-lg border border-border overflow-hidden"
                  >
                    <div
                      onClick={() => toggleAccordion(question.id)}
                      className="flex items-start justify-between gap-4 p-6 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-secondary/50 rounded-lg flex items-center justify-center flex-shrink-0">
                            {status.icon && (
                              <status.icon
                                className={`w-5 h-5 ${
                                  status.status === "correct"
                                    ? "text-green-600"
                                    : status.status === "incorrect"
                                      ? "text-red-500"
                                      : "text-muted-foreground"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-base text-foreground font-medium mb-2 leading-relaxed">
                              {question.question}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(timeSpent)}
                              </span>
                              <span
                                className={`px-2 py-1 rounded ${
                                  status.status === "correct"
                                    ? "bg-green-500/10 text-green-600"
                                    : status.status === "incorrect"
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-secondary text-secondary-foreground"
                                }`}
                              >
                                {status.status === "correct"
                                  ? "Correct"
                                  : status.status === "incorrect"
                                    ? "Incorrect"
                                    : status.status === "skipped"
                                      ? "Skipped"
                                      : "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm font-medium text-foreground">
                        Q{index + 1}
                      </div>
                    </div>
                    {expandedQuestion === question.id && (
                      <div className="px-6 pb-6 pt-0 border-t border-border bg-muted/30">
                        <div className="pt-4 space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">
                              Options
                            </h4>
                            <div className="space-y-2">
                              {question.options.map(
                                (option: string, idx: number) => {
                                  let optionClass = "bg-muted/50";
                                  let icon = null;

                                  const isCorrect =
                                    question.type ===
                                      "SINGLE_SELECT_MULTIPLE_CHOICE" ||
                                    question.type === "TRUE_FALSE"
                                      ? idx === question.correctOptionIndex
                                      : question.correctOptionIndexes?.includes(
                                          idx
                                        );

                                  const isSelected =
                                    question.type ===
                                      "SINGLE_SELECT_MULTIPLE_CHOICE" ||
                                    question.type === "TRUE_FALSE"
                                      ? answer?.answer === idx
                                      : answer?.answers?.includes(idx);

                                  if (isCorrect) {
                                    optionClass =
                                      "bg-green-500/10 border-green-500/30 border";
                                    icon = (
                                      <Check className="w-4 h-4 text-green-600" />
                                    );
                                  } else if (isSelected) {
                                    optionClass =
                                      "bg-red-500/10 border-red-500/30 border";
                                    icon = (
                                      <XCircle className="w-4 h-4 text-red-500" />
                                    );
                                  }

                                  return (
                                    <div
                                      key={idx}
                                      className={`p-3 rounded-md flex items-start gap-3 ${optionClass}`}
                                    >
                                      <div className="flex-shrink-0 mt-0.5">
                                        {icon}
                                      </div>
                                      <p className="text-sm text-foreground">
                                        {option}
                                      </p>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                          {question.feedback && (
                            <div className="my-12">
                              <h4 className="text-md font-semibold text-foreground mb-2">
                                Explanation
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {question.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentQuizResultsPage() {
  const params = useParams<{
    courseId: string;
    contentId: string;
    mockExamId: string;
  }>();

  const { data: mockExam, isLoading: mockExamLoading } = useGetMockExamQuery(
    params.mockExamId
  );

  const { data: examBank, isLoading: isExamBankLoading } = useGetExamBankQuery(
    mockExam?.courseId || "",
    mockExam?.examBankIds?.[0] || ""
  );

  const contentQuestions = useMemo(() => {
    if (!examBank?.questions) return [];

    const selectedContentId = mockExam?.selectedContentIds?.[0];
    return examBank.questions.filter((question) => {
      return question.contentId === selectedContentId;
    });
  }, [examBank, mockExam?.selectedContentIds]);

  const isLoading = mockExamLoading || isExamBankLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!mockExam || !examBank) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-destructive">Results not found</div>
      </div>
    );
  }

  if (mockExam.status !== "completed") {
    return (
      <div className="min-h-screen flex justify-center bg-background py-12">
        <div className="text-muted-foreground">
          Quiz has not been completed yet
        </div>
      </div>
    );
  }

  return (
    <ContentQuizResults
      mockExam={mockExam}
      contentQuestions={contentQuestions}
    />
  );
}
