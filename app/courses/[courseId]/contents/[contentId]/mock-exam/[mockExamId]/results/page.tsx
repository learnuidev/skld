"use client";

import type {
  Question,
  QuestionOption,
} from "@/modules/exam-bank/exam-bank.types";
import { useListExamBanksQuery } from "@/modules/exam-bank/use-list-exam-banks-query";
import { useGetMockExamQuery } from "@/modules/user-mock-exams/use-get-mock-exam-query";
import { MockExam } from "@/modules/user-mock-exams/user-mock-exams.types";
import { ArrowLeft, Check, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

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
        if (answer.answer === question.correctOptionId) {
          correct++;
        }
      } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
        const userAnswers = answer.answers || [];
        const correctAnswers = question.correctOptionIds || [];
        if (
          userAnswers.length === correctAnswers.length &&
          userAnswers.every(
            (ans: AnswerItem) =>
              typeof ans === "string" && correctAnswers.includes(ans)
          )
        ) {
          correct++;
        }
      } else if (question.type === "TRUE_FALSE") {
        if (answer.answer === question.correctOptionId) {
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
      isCorrect = answer.answer === question.correctOptionId;
    } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      const userAnswers = answer.answers || [];
      const correctAnswers = question.correctOptionIds || [];
      if (
        userAnswers.length === correctAnswers.length &&
        userAnswers.every(
          (ans: AnswerItem) =>
            typeof ans === "string" && correctAnswers.includes(ans)
        )
      ) {
        isCorrect = true;
      }
    } else if (question.type === "TRUE_FALSE") {
      isCorrect = answer.answer === question.correctOptionId;
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
    <div className="min-h-screen flex justify-center bg-background py-16 px-6">
      <div className="w-full max-w-4xl">
        <div className="mb-10">
          <Link
            href={`/courses/${params.courseId}/contents/${params.contentId}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Content
          </Link>
        </div>

        <div className="mb-16">
          <h1 className="text-4xl font-light text-foreground mb-3 tracking-tight">
            Quiz Results
          </h1>
          <p className="text-muted-foreground text-lg font-light">
            Here's how you did
          </p>
        </div>

        <div className="grid grid-cols-4 gap-12 mb-20">
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Correct
            </div>
            <div className="text-5xl font-light text-emerald-600">
              {totalCorrect}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Incorrect
            </div>
            <div className="text-5xl font-light text-rose-500">
              {totalIncorrect}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Accuracy
            </div>
            <div className="text-5xl font-light text-foreground">
              {overallAccuracy}%
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              Time
            </div>
            <div className="text-5xl font-light text-foreground">
              {formatTime(totalTimeSpent)}
            </div>
          </div>
        </div>

        <div className="border-b border-border mb-12" />

        <div className="space-y-8">
          <h2 className="text-2xl font-light text-foreground mb-8 tracking-tight">
            Question Breakdown
          </h2>

          <div className="space-y-6">
            {sortedAnswers.map((question, index) => {
              const answer = (mockExam.answers || {})[question.id];
              const status = getQuestionStatus(question, answer);
              const timeSpent = answer?.timeSpent || 0;

              return (
                <div
                  key={question.id}
                  className="border-b border-border pb-8 last:border-b-0 last:pb-0"
                >
                  <div
                    onClick={() => toggleAccordion(question.id)}
                    className="flex items-start gap-8 cursor-pointer group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-border flex items-center justify-center group-hover:border-border/80 transition-colors">
                      {status.icon && (
                        <status.icon
                          className={`w-6 h-6 ${
                            status.status === "correct"
                              ? "text-emerald-600"
                              : "text-rose-500"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-base text-foreground font-light leading-relaxed mb-3">
                        {question.question}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatTime(timeSpent)}
                        </span>
                        <span className="uppercase text-xs tracking-wider">
                          {status.status === "correct"
                            ? "Correct"
                            : "Incorrect"}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 pt-2 text-sm text-muted-foreground">
                      Q{index + 1}
                    </div>
                  </div>
                  {expandedQuestion === question.id && (
                    <div className="mt-8 ml-20 space-y-6">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                          Options
                        </h4>
                        <div className="space-y-3">
                          {question.options.map(
                            (option: QuestionOption, idx: number) => {
                              let optionClass = "";
                              let icon = null;

                              const isCorrect =
                                question.type ===
                                  "SINGLE_SELECT_MULTIPLE_CHOICE" ||
                                question.type === "TRUE_FALSE"
                                  ? option.id === question.correctOptionId
                                  : question.correctOptionIds?.includes(
                                      option.id
                                    );

                              const isSelected =
                                question.type ===
                                  "SINGLE_SELECT_MULTIPLE_CHOICE" ||
                                question.type === "TRUE_FALSE"
                                  ? answer?.answer === option.id
                                  : answer?.answers?.includes(option.id);

                              if (isCorrect) {
                                optionClass =
                                  "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800";
                                icon = (
                                  <Check className="w-4 h-4 text-emerald-600" />
                                );
                              } else if (isSelected) {
                                optionClass =
                                  "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800";
                                icon = (
                                  <XCircle className="w-4 h-4 text-rose-500" />
                                );
                              } else {
                                optionClass = "bg-muted/30 border-transparent";
                              }

                              return (
                                <div
                                  key={option.id || idx}
                                  className={`p-4 rounded-lg border flex items-start gap-3 ${optionClass}`}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    {icon}
                                  </div>
                                  <p className="text-sm text-foreground font-light leading-relaxed">
                                    {option.text}
                                  </p>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                      {question.feedback && (
                        <div className="pt-2">
                          <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                            Explanation
                          </h4>
                          <p className="text-sm text-muted-foreground font-light leading-relaxed">
                            {question.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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

  const { data: examBanks, isLoading: isExamBanksLoading } =
    useListExamBanksQuery(params.courseId);

  const selectedContentId = params.contentId;

  const contentQuestions: Question[] = useMemo(() => {
    return (
      examBanks
        ?.map((exam) => exam?.questions)
        ?.flat()
        ?.filter((question) => question?.contentId === selectedContentId) || []
    );
  }, [examBanks, selectedContentId]);

  const isLoading = isExamBanksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!mockExam || !examBanks) {
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
