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
import { motion } from "framer-motion";

type AnswerItem = number | string | boolean | null;

export default function NewMockExamPage() {
  const params = useParams<{ courseId: string; contentId: string }>();
  const router = useRouter();

  const { data: content } = useGetCourseContentQuery(
    params.courseId,
    params.contentId
  );
  const { data: examBanks } = useGetExamBanksQuery(params.courseId);
  const { data: mockExams } = useListMockExamsQuery(params.courseId);
  const createContentQuizMutation = useCreateContentQuizMutation();

  const [selectedType, _setSelectedType] = useState<"custom" | "retry" | null>(
    null
  );

  const setSelectedType = (type: "custom" | "retry" | null) => {
    _setSelectedType(type);
  };
  const [selectedExamBankIds, setSelectedExamBankIds] = useState<string[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const contentExamBanks = examBanks?.filter((exam) =>
    exam.questions.some((q) => q.contentId === params.contentId)
  );

  const failedQuestions = mockExams?.reduce<string[]>((acc, exam) => {
    if (exam.selectedContentIds?.includes(params.contentId)) {
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
                  typeof ans === "string" && correctAnswers.includes(ans)
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
          eb.questions.some((q) => q.id === questionId)
        );
        return examBank?.id;
      }) || []
    )
  ).filter(Boolean) as string[];

  const ebIds =
    selectedType === "custom"
      ? selectedExamBankIds.length > 0
        ? selectedExamBankIds
        : contentExamBanks?.map((eb) => eb.id) || []
      : failedQuestionExamBankIds;

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

  if (!content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Create Mock Exam
          </h1>
          <p className="text-lg text-muted-foreground/80">{content.title}</p>
        </div>

        {!selectedType ? (
          <motion.div
            className="grid md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card
                className="group cursor-pointer border-2 border-border hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative"
                onClick={() => setSelectedType("custom")}
                key="custom-card"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <motion.div
                      className="p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-all" />
                    </motion.div>
                  </div>
                  <div className="relative">
                    <CardTitle className="text-2xl mb-3">
                      Create New Practice Exam
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Choose from available exam banks and optionally select
                      specific questions to focus your practice on topics you
                      want to master
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="pt-6 border-t border-border/50">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="font-medium">
                        {contentExamBanks?.length || 0} exam banks available
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card
                className={`group cursor-pointer border-2 border-border hover:border-rose-400/40 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-300 overflow-hidden relative ${
                  !hasFailedQuestions ? "opacity-50 pointer-events-none" : ""
                }`}
                onClick={() => setSelectedType("retry")}
                key="retry-card"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <motion.div
                      className="p-4 rounded-2xl bg-rose-500/10 group-hover:bg-rose-500/15 transition-colors"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <RefreshCw className="w-6 h-6 text-rose-500" />
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-rose-500 transition-all" />
                    </motion.div>
                  </div>
                  <div className="relative">
                    <CardTitle className="text-2xl mb-3">
                      Review & Practice Missed Questions
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      Focus on questions you've previously missed to strengthen
                      your understanding and improve your performance
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="pt-6 border-t border-border/50">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="font-medium">
                        {failedQuestions?.length || 0} questions to review
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ) : selectedType === "custom" ? (
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedType(null);
                  setSelectedExamBankIds([]);
                  setSelectedQuestionIds([]);
                }}
                className="hover:bg-accent/50"
              >
                ← Back
              </Button>
            </motion.div>

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Select Exam Banks
                </h2>
                <p className="text-base text-muted-foreground/80 leading-relaxed">
                  Select one or more exam banks to include in your practice
                  session.
                </p>
              </div>
              {contentExamBanks?.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">
                      No exam banks available
                    </p>
                  </Card>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  {contentExamBanks?.map((examBank, index) => {
                    const contentQuestions = examBank.questions.filter(
                      (q) => q.contentId === params.contentId
                    );
                    const isSelected = selectedExamBankIds.includes(
                      examBank.id
                    );
                    return (
                      <motion.div
                        key={examBank.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card
                          className={`transition-all duration-300 hover:shadow-lg ${
                            isSelected ? "border-primary/50 bg-primary/5" : ""
                          }`}
                        >
                          <CardHeader>
                            <div className="flex items-start gap-5">
                              <motion.div
                                className="pt-1"
                                whileHover={{ scale: 1.2 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <input
                                  type="checkbox"
                                  id={examBank.id}
                                  checked={isSelected}
                                  onChange={() => toggleExamBank(examBank.id)}
                                  className="w-5 h-5 rounded-md border-2"
                                />
                              </motion.div>
                              <div className="flex-1">
                                <CardTitle className="text-xl mb-2">
                                  {examBank.title}
                                </CardTitle>
                                {examBank.description && (
                                  <CardDescription className="text-base mb-3">
                                    {examBank.description}
                                  </CardDescription>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
                                  <span className="font-medium">
                                    {contentQuestions.length} questions
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Select Questions
                </h2>
                <p className="text-base text-muted-foreground/80 leading-relaxed">
                  Select specific questions from the exam banks above. You can
                  choose to select all questions from an entire exam bank or
                  pick individual questions.
                </p>
              </div>
              {selectedExamBankIds.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">
                      Please select at least one exam bank above to see
                      questions
                    </p>
                  </Card>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  {contentExamBanks
                    ?.filter((eb) => selectedExamBankIds.includes(eb.id))
                    .map((examBank, index) => {
                      const contentQuestions = examBank.questions.filter(
                        (q) => q.contentId === params.contentId
                      );
                      return (
                        <motion.div
                          key={examBank.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="hover:shadow-md transition-all">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-lg mb-1">
                                    {examBank.title}
                                  </CardTitle>
                                  <p className="text-sm text-muted-foreground/80">
                                    {contentQuestions.length} questions
                                  </p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {contentQuestions.map((question, qIndex) => (
                                  <motion.label
                                    key={question.id}
                                    className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/50 cursor-pointer transition-all"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      duration: 0.2,
                                      delay: qIndex * 0.03,
                                    }}
                                    whileHover={{ x: 5 }}
                                  >
                                    <motion.input
                                      type="checkbox"
                                      checked={selectedQuestionIds.includes(
                                        question.id
                                      )}
                                      onChange={() =>
                                        toggleQuestion(question.id)
                                      }
                                      className="w-4 h-4 rounded"
                                      whileHover={{ scale: 1.2 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 400,
                                      }}
                                    />
                                    <span className="flex-1 text-sm leading-relaxed">
                                      {question.question.slice(0, 120)}
                                      {question.question.length > 120 && "..."}
                                    </span>
                                  </motion.label>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </motion.div>

            <motion.div
              className="flex justify-end pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleCreateExam}
                  disabled={selectedExamBankIds.length === 0 || isCreating}
                  size="lg"
                  className="rounded-full px-8"
                >
                  {isCreating ? "Creating Exam..." : "Begin Practice Session"}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
              <Button
                variant="ghost"
                onClick={() => setSelectedType(null)}
                className="hover:bg-accent/50"
              >
                ← Back
              </Button>
            </motion.div>

            <motion.div
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Questions to Review
                </h2>
                <p className="text-base text-muted-foreground/80 leading-relaxed">
                  These are questions you previously missed. Review them
                  carefully to understand the correct answers and improve your
                  understanding.
                </p>
              </div>

              {failedQuestions && failedQuestions.length > 0 ? (
                <div className="space-y-4">
                  {failedQuestions.map((questionId, index) => {
                    const question = examBanks
                      ?.flatMap((eb) => eb.questions)
                      .find((q) => q.id === questionId);
                    if (!question) return null;
                    return (
                      <motion.div
                        key={questionId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="hover:border-primary/30 hover:shadow-md transition-all">
                          <CardContent className="p-6">
                            <p className="text-base leading-relaxed">
                              {question.question.slice(0, 180)}
                              {question.question.length > 180 && "..."}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-16 text-center border-2 border-dashed">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <RefreshCw className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-30" />
                    </motion.div>
                    <p className="text-lg text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
                      No questions to review yet. Take some practice exams and
                      come back to review any questions you miss.
                    </p>
                  </Card>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className="flex justify-end pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleCreateExam}
                  disabled={!hasFailedQuestions || isCreating}
                  size="lg"
                  className="rounded-full px-8"
                >
                  {isCreating ? "Creating Exam..." : "Start Review Session"}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
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
