"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { useGetExamBanksQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useCreateContentQuizMutation } from "@/modules/content-quiz/use-create-content-quiz-mutation";
import { useListMockExamsQuery } from "@/modules/user-mock-exams/use-list-mock-exams-query";
import type { Answer } from "@/modules/user-mock-exams/user-mock-exams.types";
import { ChevronRight, GraduationCap, RefreshCw } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type AnswerItem = number | string | boolean | null;

export default function NewMockExamPage() {
  const params = useParams<{ courseId: string; contentId: string }>();
  const router = useRouter();

  const { data: content } = useGetCourseContentQuery(
    params.courseId,
    params.contentId,
  );
  const { data: examBanks } = useGetExamBanksQuery(params.courseId);
  const { data: mockExams } = useListMockExamsQuery(params.courseId);
  const createContentQuizMutation = useCreateContentQuizMutation();

  const [selectedType, setSelectedType] = useState<"custom" | "retry" | null>(
    null,
  );
  const [selectedExamBankIds, setSelectedExamBankIds] = useState<string[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const contentExamBanks = examBanks?.filter((exam) =>
    exam.questions.some((q) => q.contentId === params.contentId),
  );

  const failedQuestions = mockExams?.reduce<string[]>((acc, exam) => {
    if (
      exam.examType === "failed" ||
      exam.selectedContentIds?.includes(params.contentId)
    ) {
      Object.entries(exam.answers || {}).forEach(([questionId, answer]) => {
        const question = examBanks
          ?.flatMap((eb) => eb.questions)
          .find((q) => q.id === questionId);
        if (question && answer) {
          let isCorrect = false;
          if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
            isCorrect = answer.answer === question.correctOptionId;
          } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
            const userAnswers = answer.answers || [];
            const correctAnswers = question.correctOptionIds || [];
            isCorrect =
              userAnswers.length === correctAnswers.length &&
              userAnswers.every(
                (ans: AnswerItem) =>
                  typeof ans === "string" && correctAnswers.includes(ans),
              );
          } else if (question.type === "TRUE_FALSE") {
            isCorrect = answer.answer === question.correctOptionId;
          }
          if (!isCorrect && !acc.includes(questionId)) {
            acc.push(questionId);
          }
        }
      });
    }
    return acc;
  }, []);

  const hasFailedQuestions = failedQuestions && failedQuestions.length > 0;

  const failedQuestionExamBankIds = Array.from(
    new Set(
      failedQuestions?.map((questionId) => {
        const question = examBanks
          ?.flatMap((eb) => eb.questions)
          .find((q) => q.id === questionId);
        const examBank = examBanks?.find((eb) =>
          eb.questions.some((q) => q.id === questionId),
        );
        return examBank?.id;
      }) || [],
    ),
  ).filter(Boolean) as string[];

  const handleCreateExam = async () => {
    setIsCreating(true);
    try {
      const mockExam = await createContentQuizMutation.mutateAsync({
        courseId: params.courseId,
        contentId: params.contentId,
        examBankIds:
          selectedType === "custom"
            ? selectedExamBankIds
            : failedQuestionExamBankIds,
        questionIds:
          selectedType === "custom"
            ? selectedQuestionIds
            : failedQuestions || [],
      });
      router.push(
        `/courses/${params.courseId}/contents/${params.contentId}/mock-exam/${mockExam.id}`,
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
        : [...prev, examBankId],
    );
  };

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    );
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Create Mock Exam
          </h1>
          <p className="text-muted-foreground">{content.title}</p>
        </div>

        {!selectedType ? (
          <div className="grid md:grid-cols-2 gap-6">
            <Card
              className="cursor-pointer hover:border-primary/50 transition-all"
              onClick={() => setSelectedType("custom")}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Create New Practice Exam</CardTitle>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  Choose from available exam banks and optionally select
                  specific questions to focus your practice on topics you want
                  to master
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="mr-2">
                    {contentExamBanks?.length || 0} exam banks available
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer hover:border-primary/50 transition-all ${
                !hasFailedQuestions ? "opacity-50 pointer-events-none" : ""
              }`}
              onClick={() => setSelectedType("retry")}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-rose-500/10">
                    <RefreshCw className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <CardTitle>Review & Practice Missed Questions</CardTitle>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  Focus on questions you've previously missed to strengthen your
                  understanding and improve your performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="mr-2">
                    {failedQuestions?.length || 0} questions to review
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : selectedType === "custom" ? (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedType(null);
                setSelectedExamBankIds([]);
                setSelectedQuestionIds([]);
              }}
            >
              ← Back
            </Button>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Choose Exam Banks to Practice
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Select one or more exam banks to include in your practice
                  session. You can also choose specific questions within each
                  bank.
                </p>
              </div>
              {contentExamBanks?.length === 0 ? (
                <p className="text-muted-foreground">No exam banks available</p>
              ) : (
                <div className="space-y-3">
                  {contentExamBanks?.map((examBank) => {
                    const contentQuestions = examBank.questions.filter(
                      (q) => q.contentId === params.contentId,
                    );
                    return (
                      <Card key={examBank.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                id={examBank.id}
                                checked={selectedExamBankIds.includes(
                                  examBank.id,
                                )}
                                onChange={() => toggleExamBank(examBank.id)}
                                className="mt-1"
                              />
                              <div>
                                <CardTitle className="text-lg">
                                  {examBank.title}
                                </CardTitle>
                                {examBank.description && (
                                  <CardDescription>
                                    {examBank.description}
                                  </CardDescription>
                                )}
                                <p className="text-sm text-muted-foreground mt-1">
                                  {contentQuestions.length} questions
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        {selectedExamBankIds.includes(examBank.id) && (
                          <CardContent>
                            <div className="space-y-2 mt-4 pt-4 border-t">
                              <div>
                                <p className="text-sm font-medium mb-1">
                                  Select Specific Questions (Optional)
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Leave all unchecked to include all questions
                                  from this exam bank
                                </p>
                              </div>
                              {contentQuestions.map((question) => (
                                <label
                                  key={question.id}
                                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedQuestionIds.includes(
                                      question.id,
                                    )}
                                    onChange={() => toggleQuestion(question.id)}
                                  />
                                  <span className="text-sm">
                                    {question.question.slice(0, 100)}
                                    {question.question.length > 100 && "..."}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleCreateExam}
                disabled={selectedExamBankIds.length === 0 || isCreating}
              >
                {isCreating ? "Creating Exam..." : "Begin Practice Session"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Button variant="ghost" onClick={() => setSelectedType(null)}>
              ← Back
            </Button>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Questions to Review</h2>
                <p className="text-muted-foreground">
                  These are the questions you previously missed. Review them
                  carefully to understand the correct answers and improve your
                  understanding.
                </p>
              </div>

              {failedQuestions && failedQuestions.length > 0 ? (
                <div className="space-y-3">
                  {failedQuestions.map((questionId) => {
                    const question = examBanks
                      ?.flatMap((eb) => eb.questions)
                      .find((q) => q.id === questionId);
                    if (!question) return null;
                    return (
                      <Card key={questionId}>
                        <CardContent className="pt-6">
                          <p className="text-sm">
                            {question.question.slice(0, 150)}
                            {question.question.length > 150 && "..."}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed rounded-lg">
                  <RefreshCw className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    No questions to review yet. Take some practice exams and
                    come back to review any questions you miss.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleCreateExam}
                disabled={!hasFailedQuestions || isCreating}
              >
                {isCreating ? "Creating Exam..." : "Start Review Session"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isCreating}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Preparing Your Practice Session</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Setting up your exam...</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
