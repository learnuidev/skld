"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGetExamBankQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useUpdateExamBankMutation } from "@/modules/exam-bank/use-exam-bank-mutations";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { Question } from "@/modules/exam-bank/exam-bank.types";
import { Domain } from "@/modules/course/course.types";
import { Button } from "@/components/ui/button";

export default function ExamBankDetailPage() {
  const params = useParams<{ courseId: string; examBankId: string }>();
  const courseId = params.courseId;
  const examBankId = params.examBankId;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<
    number | null
  >(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [examBankData, setExamBankData] = useState<{
    title: string;
    description: string;
  }>({ title: "", description: "" });

  const { data: examBank, isLoading } = useGetExamBankQuery(
    courseId,
    examBankId
  );
  const { data: course } = useGetCourseQuery(courseId);
  const updateExamBankMutation = useUpdateExamBankMutation(
    courseId,
    examBankId
  );

  const domains = course?.domains || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center text-slate-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!examBank) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center text-red-500">Exam bank not found</div>
        </div>
      </div>
    );
  }

  if (questions.length === 0 && examBank.questions.length > 0) {
    setQuestions(examBank.questions);
    setExamBankData({
      title: examBank.title,
      description: examBank.description || "",
    });
  }

  const handleSave = async () => {
    try {
      await updateExamBankMutation.mutateAsync({
        title: examBankData.title,
        description: examBankData.description,
        questions,
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save exam bank:", error);
    }
  };

  const handleQuestionUpdate = (
    index: number,
    field: keyof Question,
    value: string | number | number[] | string[] | undefined
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
    setHasUnsavedChanges(true);
  };

  const handleOptionUpdate = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q: Question, i: number) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt: string, oi: number) =>
                oi === optionIndex ? value : opt
              ),
            }
          : q
      )
    );
    setHasUnsavedChanges(true);
  };

  const addOption = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex ? { ...q, options: [...q.options, ""] } : q
      )
    );
    setHasUnsavedChanges(true);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev: Question[]) =>
      prev.map((q: Question, i: number) =>
        i === questionIndex && q.options.length > 1
          ? { ...q, options: q.options.filter((_: string, oi: number) => oi !== optionIndex) }
          : q
      )
    );
    setHasUnsavedChanges(true);
  };

  const removeQuestion = (index: number) => {
    if (confirm("Remove this question?")) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
      if (expandedQuestionIndex === index) {
        setExpandedQuestionIndex(null);
      } else if (
        expandedQuestionIndex !== null &&
        expandedQuestionIndex > index
      ) {
        setExpandedQuestionIndex(expandedQuestionIndex - 1);
      }
      setHasUnsavedChanges(true);
    }
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: "",
        domainId: "",
        question: "",
        options: ["", "", ""],
        type: "SINGLE_SELECT_MULTIPLE_CHOICE",
        feedback: "",
        difficulty: "easy",
        questionType: "definition",
        correctOptionIndex: 0,
      },
    ]);
    setExpandedQuestionIndex(questions.length);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="mb-12">
          <Link
            href={`/studio/${courseId}`}
            className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-6"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Course
          </Link>

          <div className="mb-8">
            <input
              type="text"
              value={examBankData.title}
              onChange={(e) => {
                setExamBankData({ ...examBankData, title: e.target.value });
                setHasUnsavedChanges(true);
              }}
              className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 w-full mb-4"
              placeholder="Exam Bank Title"
            />
            <input
              type="text"
              value={examBankData.description}
              onChange={(e) => {
                setExamBankData({ ...examBankData, description: e.target.value });
                setHasUnsavedChanges(true);
              }}
              className="text-xl text-slate-600 dark:text-slate-400 bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder-slate-400"
              placeholder="Add a description..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </div>
            <div className="flex gap-4">
              {hasUnsavedChanges && (
                <span className="px-4 py-2 text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full">
                  Unsaved changes
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || updateExamBankMutation.isPending}
                className="rounded-full px-8"
              >
                {updateExamBankMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <QuestionEditorCard
              key={index}
              index={index}
              question={question}
              onUpdate={(field: keyof Question, value: string | number | number[] | string[] | undefined) =>
                handleQuestionUpdate(index, field, value)
              }
              onOptionUpdate={(oi: number, v: string) =>
                handleOptionUpdate(index, oi, v)
              }
              onAddOption={() => addOption(index)}
              onRemoveOption={(oi: number) => removeOption(index, oi)}
              onRemove={() => removeQuestion(index)}
              isExpanded={expandedQuestionIndex === index}
              onToggle={() =>
                setExpandedQuestionIndex(
                  expandedQuestionIndex === index ? null : index
                )
              }
              domains={domains}
            />
          ))}
        </div>

        <div className="mt-12">
          <button
            onClick={addQuestion}
            className="w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300 transition-all bg-white dark:bg-[rgb(10,11,12)] hover:shadow-xl"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="text-lg font-medium">Add Question</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function QuestionEditorCard({
  index,
  question,
  onUpdate,
  onOptionUpdate,
  onAddOption,
  onRemoveOption,
  onRemove,
  isExpanded,
  onToggle,
  domains,
}: {
  index: number;
  question: Question;
  onUpdate: (field: keyof Question, value: string | number | number[] | string[] | undefined) => void;
  onOptionUpdate: (optionIndex: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onRemove: () => void;
  isExpanded: boolean;
  onToggle: () => void;
  domains?: Domain[];
}) {
  const handleCorrectOptionChange = (optionIndex: number) => {
    if (question.type === "SINGLE_SELECT_MULTIPLE_CHOICE") {
      onUpdate("correctOptionIndex", optionIndex);
      onUpdate("correctOptionIndexes", undefined);
    } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      const current = question.correctOptionIndexes || [];
      const exists = current.includes(optionIndex);
      const newIndexes = exists
        ? current.filter((i) => i !== optionIndex)
        : [...current, optionIndex];
      onUpdate(
        "correctOptionIndexes",
        newIndexes.length > 0 ? newIndexes : undefined
      );
      onUpdate("correctOptionIndex", undefined);
    } else if (question.type === "TRUE_FALSE") {
      onUpdate("correctOptionIndex", optionIndex);
      onUpdate("correctOptionIndexes", undefined);
    }
  };

  const isOptionCorrect = (optionIndex: number) => {
    if (
      question.type === "SINGLE_SELECT_MULTIPLE_CHOICE" ||
      question.type === "TRUE_FALSE"
    ) {
      return question.correctOptionIndex === optionIndex;
    } else if (question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE") {
      return question.correctOptionIndexes?.includes(optionIndex) || false;
    }
    return false;
  };

  const getDomainName = () => {
    if (!question.domainId || !domains) return question.domainId;
    const domain = domains.find((d) => d.id === question.domainId);
    return domain?.name || question.domainId;
  };

  return (
    <div className="bg-white dark:bg-[rgb(10,11,12)] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {index + 1}
              </span>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={question.question}
                onChange={(e) => onUpdate("question", e.target.value)}
                placeholder="Enter your question here..."
                className="text-xl font-semibold text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder-slate-400"
              />
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
                  {question.type}
                </span>
                {question.difficulty && (
                  <span className="px-3 py-1 text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
                    {question.difficulty}
                  </span>
                )}
                {question.questionType && (
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                    {question.questionType}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggle}
              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <svg
                className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <button
              onClick={onRemove}
              className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-red-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Domain
                </label>
                <select
                  value={question.domainId}
                  onChange={(e) => onUpdate("domainId", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                >
                  {domains && domains.length > 0 ? (
                    <>
                      <option value="">Select domain</option>
                      {domains.map((domain: Domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value={question.domainId}>{getDomainName()}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Question Type
                </label>
                <select
                  value={question.type}
                  onChange={(e) => onUpdate("type", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                >
                  <option value="SINGLE_SELECT_MULTIPLE_CHOICE">
                    Single Select Multiple Choice
                  </option>
                  <option value="MULTIPLE_SELECT_MULTIPLE_CHOICE">
                    Multiple Select Multiple Choice
                  </option>
                  <option value="TRUE_FALSE">True/False</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Answer Options
              </label>
              <div className="space-y-4">
                {question.options.map((option: string, oi: number) => (
                  <div key={oi} className="flex gap-4 items-start">
                    <div className="pt-4">
                      {question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE" ? (
                        <input
                          type="checkbox"
                          checked={isOptionCorrect(oi)}
                          onChange={() => handleCorrectOptionChange(oi)}
                          className="w-6 h-6 rounded-md border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                        />
                      ) : (
                        <input
                          type="radio"
                          name={`correct-option-${index}`}
                          checked={isOptionCorrect(oi)}
                          onChange={() => handleCorrectOptionChange(oi)}
                          className="w-6 h-6 rounded-md border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                        />
                      )}
                    </div>
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-bold text-slate-600 dark:text-slate-400">
                        {String.fromCharCode(65 + oi)}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => onOptionUpdate(oi, e.target.value)}
                      className="flex-1 px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    />
                    <button
                      onClick={() => onRemoveOption(oi)}
                      disabled={question.options.length <= 1}
                      className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={onAddOption}
                  className="w-full h-14 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-medium">Add Option</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Feedback / Explanation
              </label>
              <textarea
                value={question.feedback}
                onChange={(e) => onUpdate("feedback", e.target.value)}
                rows={3}
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white resize-none"
                placeholder="Explain why this answer is correct..."
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Difficulty Level
                </label>
                <select
                  value={question.difficulty || ""}
                  onChange={(e) =>
                    onUpdate("difficulty", e.target.value || undefined)
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Question Category
                </label>
                <select
                  value={question.questionType || ""}
                  onChange={(e) =>
                    onUpdate("questionType", e.target.value || undefined)
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                >
                  <option value="">Select category</option>
                  <option value="scenario">Scenario</option>
                  <option value="definition">Definition</option>
                  <option value="sequence">Sequence</option>
                  <option value="identification">Identification</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
