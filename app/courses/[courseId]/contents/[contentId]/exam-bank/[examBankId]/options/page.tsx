"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetExamBankQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import Link from "next/link";
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
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-slate-300 dark:text-slate-700">Loading...</div>
      </div>
    );
  }

  if (!examBank || !course || !content) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-slate-300 dark:text-slate-700">Not found</div>
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
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-2xl mx-auto px-6 py-32">
        <div className="space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-light text-slate-900 dark:text-white">
              Exam bank created
            </h1>
            <p className="text-lg text-slate-400 dark:text-slate-600">
              {examBank.questions?.length || 0} questions
            </p>
          </div>

          <div className="space-y-4 pt-8">
            <Link
              href={`/courses/${params.courseId}/contents/${params.contentId}`}
              className="block py-6 px-8 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="text-xl text-slate-900 dark:text-white">
                Back to content
              </div>
            </Link>

            <button
              onClick={handleGenerateQuiz}
              disabled={isCreatingQuiz}
              className="block w-full py-6 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-xl">
                {isCreatingQuiz ? "Creating quiz..." : "Start quiz"}
              </div>
            </button>

            <Link
              href={`/studio/${params.courseId}/exam-banks/${params.examBankId}`}
              className="block py-6 px-8 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="text-xl text-slate-900 dark:text-white">
                Edit exam bank
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
