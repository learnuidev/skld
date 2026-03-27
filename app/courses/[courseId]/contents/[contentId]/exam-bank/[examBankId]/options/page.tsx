"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetExamBankQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Edit3,
  FileQuestion,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useCreateContentQuizMutation } from "@/modules/content-quiz/use-create-content-quiz-mutation";

export default function ExamBankOptionsPage() {
  const params = useParams<{
    courseId: string;
    contentId: string;
    examBankId: string;
  }>();
  const router = useRouter();

  const { data: examBank, isLoading: examBankLoading } = useGetExamBankQuery(
    params.courseId,
    params.examBankId,
  );
  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    params.courseId,
  );
  const { data: content, isLoading: contentLoading } = useGetCourseContentQuery(
    params.courseId,
    params.contentId,
  );

  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const createContentQuizMutation = useCreateContentQuizMutation();

  if (examBankLoading || courseLoading || contentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 dark:text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!examBank || !course || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-slate-400 dark:text-slate-600">Not found</div>
      </div>
    );
  }

  const handleGenerateQuiz = async () => {
    setIsCreatingQuiz(true);
    try {
      const quiz = await createContentQuizMutation.mutateAsync({
        courseId: params.courseId,
        contentId: params.contentId,
        examBankIds: [params.examBankId],
        examType: "untimed",
        examVariant: "normal",
      });

      router.push(
        `/courses/${params.courseId}/contents/${params.contentId}/mock-exam/${quiz.id}`,
      );
    } catch (error) {
      console.error("Failed to create quiz:", error);
      alert("Failed to create quiz. Please try again.");
      setIsCreatingQuiz(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
        <div className="mb-12">
          <Link
            href={`/courses/${params.courseId}/contents/${params.contentId}`}
            className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Content
          </Link>
        </div>

        <div className="space-y-16">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl mb-4 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-light text-slate-900 dark:text-white tracking-tight">
              Exam Bank Ready
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-light max-w-md mx-auto">
              Your exam bank{" "}
              <span className="font-medium">{examBank.title}</span> has been
              created with {examBank.questions?.length || 0} questions
            </p>
          </div>

          <div className="space-y-6">
            <OptionCard
              icon={<ArrowLeft className="w-6 h-6" />}
              title="Return to Content"
              description="Go back to the content page"
              href={`/courses/${params.courseId}/contents/${params.contentId}`}
              variant="secondary"
            />

            <OptionCard
              icon={<FileQuestion className="w-6 h-6" />}
              title="Generate Mock Exam"
              description="Create a quiz from these questions"
              onClick={handleGenerateQuiz}
              disabled={isCreatingQuiz}
              isLoading={isCreatingQuiz}
              loadingText="Creating Quiz..."
              variant="primary"
            />

            <OptionCard
              icon={<Edit3 className="w-6 h-6" />}
              title="Edit Exam Bank"
              description="Modify questions and settings"
              href={`/studio/${params.courseId}/exam-banks/${params.examBankId}`}
              variant="outline"
            />
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-400 dark:text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Exam bank successfully generated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  icon,
  title,
  description,
  href,
  onClick,
  disabled,
  isLoading,
  loadingText,
  variant = "outline",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "outline";
}) {
  const baseClasses =
    "w-full p-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] text-left border";

  const variantClasses = {
    primary:
      "bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 border-slate-900 dark:border-white hover:shadow-xl hover:shadow-slate-900/10",
    secondary:
      "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-900/5",
    outline:
      "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-900/5",
  };

  const iconClasses = {
    primary: "text-white dark:text-slate-900",
    secondary: "text-slate-600 dark:text-slate-400",
    outline: "text-slate-600 dark:text-slate-400",
  };

  const titleClasses = {
    primary: "text-white dark:text-slate-900",
    secondary: "text-slate-900 dark:text-white",
    outline: "text-slate-900 dark:text-white",
  };

  const descriptionClasses = {
    primary: "text-slate-300 dark:text-slate-700",
    secondary: "text-slate-600 dark:text-slate-400",
    outline: "text-slate-600 dark:text-slate-400",
  };

  const buttonContent = (
    <div className={`${baseClasses} ${variantClasses[variant]}`}>
      <div className="flex items-start gap-5">
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${variant === "primary" ? "bg-white/10 dark:bg-slate-900/10" : "bg-slate-100 dark:bg-slate-800"}`}
        >
          <div className={iconClasses[variant]}>{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-medium mb-2 ${titleClasses[variant]}`}>
            {isLoading ? loadingText : title}
          </h3>
          <p className={`text-base ${descriptionClasses[variant]}`}>
            {description}
          </p>
        </div>
        {!isLoading && (
          <div className="flex-shrink-0">
            <svg
              className={`w-5 h-5 ${
                variant === "primary"
                  ? "text-white/50 dark:text-slate-900/50"
                  : "text-slate-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );

  if (href && !isLoading) {
    return (
      <Link href={href} className="block">
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="block w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {buttonContent}
    </button>
  );
}
