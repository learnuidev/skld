"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateContentQuizMutation } from "@/modules/content-quiz/use-create-content-quiz-mutation";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { useListExamBanksV2Query } from "@/modules/exam-bank-v2/use-list-exam-banks-v2-query";
import { useListQuestionsQuery } from "@/modules/exam-bank-v2/use-list-questions-query";
import { useListMockExamsQuery } from "@/modules/user-mock-exams/use-list-mock-exams-query";
import type { Answer } from "@/modules/user-mock-exams/user-mock-exams.types";
import {
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Play,
  RefreshCw,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ExamBankItem } from "./exam-bank-item";

type AnswerItem = number | string | boolean | null;

function checkCorrect(
  question: {
    type: string;
    correctOptionId?: string;
    correctOptionIds?: string[];
  },
  answer: Answer
): boolean {
  if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
    return answer.answer === question.correctOptionId;
  }
  if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
    const userAnswers = answer.answers || [];
    const correctAnswers = question.correctOptionIds || [];
    return (
      userAnswers.length === correctAnswers.length &&
      userAnswers.every(
        (ans: AnswerItem) =>
          typeof ans === "string" && correctAnswers.includes(ans)
      )
    );
  }
  if (question.type === "TRUE_FALSE") {
    return answer.answer === question.correctOptionId;
  }
  return false;
}

export default function NewMockExamPage() {
  const params = useParams<{ courseId: string; contentId: string }>();
  const router = useRouter();

  const { data: content } = useGetCourseContentQuery(
    params.courseId,
    params.contentId
  );
  const { data: examBanksData } = useListExamBanksV2Query({
    contentId: params.contentId,
  });
  const examBanks = examBanksData?.items || [];
  const { data: mockExams } = useListMockExamsQuery(params.courseId);
  const createContentQuizMutation = useCreateContentQuizMutation();

  const [selectedType, setSelectedType] = useState<"custom" | "retry" | null>(
    null
  );
  const [selectedExamBankIds, setSelectedExamBankIds] = useState<string[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [selectedFailedQuestionIds, setSelectedFailedQuestionIds] = useState<
    string[]
  >([]);
  const [isCreating, setIsCreating] = useState(false);

  const contentExamBanks = examBanks;

  const { data: questionsData } = useListQuestionsQuery({
    examBankIds:
      selectedExamBankIds.length > 0 ? selectedExamBankIds : undefined,
    contentId: selectedExamBankIds.length === 0 ? params.contentId : undefined,
  });

  const allQuestions = useMemo(
    () => questionsData?.items || [],
    [questionsData]
  );

  const questionLookup = useMemo(() => {
    const map = new Map<string, (typeof allQuestions)[number]>();
    allQuestions.forEach((q) => map.set(q.id, q));
    return map;
  }, [allQuestions]);

  const sortedExams = useMemo(
    () =>
      [...(mockExams || [])]
        .filter((e) => e.selectedContentIds?.includes(params.contentId))
        .sort((a, b) => a.createdAt - b.createdAt),
    [mockExams, params.contentId]
  );

  const questionHistory = useMemo(() => {
    const map = new Map<string, boolean[]>();
    for (const exam of sortedExams) {
      for (const [qId, answer] of Object.entries(exam.answers || {})) {
        if (!answer) continue;
        const question = questionLookup.get(qId);
        if (!question) continue;
        const isCorrect = checkCorrect(question, answer);
        const history = map.get(qId) || [];
        history.push(isCorrect);
        map.set(qId, history);
      }
    }
    for (const [qId, history] of map) {
      map.set(qId, history.slice(-5));
    }
    return map;
  }, [sortedExams, questionLookup]);

  const failedQuestions = useMemo(
    () =>
      Array.from(questionHistory.entries())
        .filter(([, history]) => history.some((c) => !c))
        .map(([qId]) => qId),
    [questionHistory]
  );

  const hasFailedQuestions = failedQuestions && failedQuestions.length > 0;

  const failedQuestionExamBankIds = Array.from(
    new Set(
      failedQuestions?.map((questionId) => {
        const question = allQuestions.find((q) => q.id === questionId);
        return question?.examBankId;
      }) || []
    )
  ).filter(Boolean) as string[];

  const handleCreateExam = async () => {
    setIsCreating(true);
    try {
      const mockExam = await createContentQuizMutation.mutateAsync({
        courseId: params.courseId,
        contentId: params.contentId,
        examBankIds:
          selectedType === "custom"
            ? selectedExamBankIds.length > 0
              ? selectedExamBankIds
              : contentExamBanks?.map((eb) => eb.id) || []
            : failedQuestionExamBankIds,
        questionIds:
          selectedType === "custom"
            ? selectedQuestionIds.length > 0
              ? selectedQuestionIds
              : undefined
            : selectedFailedQuestionIds.length > 0
              ? selectedFailedQuestionIds
              : failedQuestions || [],
        examVariant: selectedType === "retry" ? "failed" : null,
      });
      router.push(
        `/courses/${params.courseId}/contents/${params.contentId}/mock-exam/${mockExam.id}`
      );
    } catch (error) {
      console.error("Failed to create quiz:", error);
      setIsCreating(false);
    }
  };

  const toggleExamBank = (examBankId: string) => {
    setSelectedExamBankIds((prev) =>
      prev.includes(examBankId)
        ? prev.filter((id) => id !== examBankId)
        : [...prev, examBankId]
    );
  };

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const toggleFailedQuestion = (questionId: string) => {
    setSelectedFailedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-16 lg:pb-24 pt-12 max-w-3xl">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">
            Create Mock Exam
          </h1>
          <p className="text-muted-foreground text-lg">{content.title}</p>
        </header>

        {!selectedType ? (
          <div className="space-y-6">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
              Choose Exam Type
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setSelectedType("custom");
                  setSelectedExamBankIds([]);
                  setSelectedQuestionIds([]);
                  setSelectedFailedQuestionIds([]);
                }}
                className="p-6 rounded-xl border-2 text-left transition-all border-border hover:border-foreground/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <GraduationCap className="w-6 h-6" />
                  <span className="text-lg font-medium">
                    Create New Practice Exam
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose from available exam banks and optionally select
                  specific questions
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">
                    {contentExamBanks?.length || 0} exam banks available
                  </span>
                </div>
              </button>
              <button
                onClick={() => {
                  setSelectedType("retry");
                  setSelectedExamBankIds([]);
                  setSelectedQuestionIds([]);
                  setSelectedFailedQuestionIds([]);
                }}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  !hasFailedQuestions
                    ? "opacity-50 border-border cursor-not-allowed"
                    : "border-border hover:border-foreground/30"
                }`}
                disabled={!hasFailedQuestions}
              >
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="w-6 h-6" />
                  <span className="text-lg font-medium">
                    Review Missed Questions
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Focus on questions you&apos;ve previously missed
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">
                    {failedQuestions?.length || 0} questions to review
                  </span>
                </div>
              </button>
            </div>
          </div>
        ) : selectedType === "custom" ? (
          <div className="space-y-12">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedType(null);
                setSelectedExamBankIds([]);
                setSelectedQuestionIds([]);
              }}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            {/* Exam Bank Selection */}
            <div>
              <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
                Select Exam Banks
                <span className="ml-2 text-xs font-normal">(optional)</span>
              </h2>
              {contentExamBanks?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No exam banks available
                </div>
              ) : (
                <div className="space-y-3">
                  {contentExamBanks?.map((examBank) => (
                    <ExamBankItem
                      key={examBank.id}
                      examBank={examBank}
                      isSelected={selectedExamBankIds.includes(examBank.id)}
                      onToggle={toggleExamBank}
                      selectedQuestionIds={selectedQuestionIds}
                      onToggleQuestion={toggleQuestion}
                    />
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                Leave all exam banks unselected to include all available
                questions
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-8 border-t border-border">
              <button
                onClick={handleCreateExam}
                disabled={contentExamBanks?.length === 0 || isCreating}
                className="w-full sm:w-auto px-12 py-4 bg-foreground text-background rounded-xl font-medium text-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                {isCreating ? "Creating Exam..." : "Begin Practice Session"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedType(null);
                setSelectedFailedQuestionIds([]);
              }}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            {/* Questions to Review */}
            <div>
              <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
                Questions to Review
                <span className="ml-2 text-xs font-normal">(optional)</span>
              </h2>
              {failedQuestions && failedQuestions.length > 0 ? (
                <div className="space-y-3">
                  {failedQuestions.map((questionId) => {
                    const question = allQuestions.find(
                      (q) => q.id === questionId
                    );
                    if (!question) return null;
                    const isSelected =
                      selectedFailedQuestionIds.includes(questionId);
                    return (
                      <button
                        key={questionId}
                        onClick={() => toggleFailedQuestion(questionId)}
                        className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? "border-foreground/60 bg-foreground/5"
                            : "border-border hover:border-foreground/30"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-foreground bg-foreground"
                              : "border-foreground"
                          }`}
                        >
                          {isSelected && (
                            <ChevronRight className="w-3 h-3 text-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-relaxed mb-1.5">
                            {question.question.slice(0, 180)}
                            {question.question.length > 180 && "..."}
                          </p>
                          <div className="flex items-center gap-1.5">
                            {(() => {
                              const history =
                                questionHistory.get(questionId) || [];
                              const filled = 5;
                              const dots: (boolean | null)[] = [
                                ...Array(filled - history.length).fill(null),
                                ...history,
                              ];
                              return dots.map((correct, i) => (
                                <span
                                  key={i}
                                  className={`inline-block w-2 h-2 rounded-full ${
                                    correct === null
                                      ? "bg-foreground/10"
                                      : correct
                                        ? "bg-emerald-500"
                                        : "bg-red-500"
                                  }`}
                                />
                              ));
                            })()}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No questions to review yet. Take some practice exams and come
                  back to review any questions you miss.
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-4">
                Leave all questions unselected to include all questions
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-8 border-t border-border">
              <button
                onClick={handleCreateExam}
                disabled={!hasFailedQuestions || isCreating}
                className="w-full sm:w-auto px-12 py-4 bg-foreground text-background rounded-xl font-medium text-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                {isCreating ? "Creating Exam..." : "Start Review Session"}
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isCreating}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-2xl">
              Preparing Your Practice Session
            </DialogTitle>
            <p className="text-base text-muted-foreground/80">
              Setting up your exam...
            </p>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
