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
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="px-6 py-16">
          <div className="text-center text-slate-400 dark:text-slate-600">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!examBank) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="px-6 py-16">
          <div className="text-center text-slate-400 dark:text-slate-600">
            Exam bank not found
          </div>
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
          ? {
              ...q,
              options: q.options.filter(
                (_: string, oi: number) => oi !== optionIndex
              ),
            }
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
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="sticky top-0 bg-white dark:bg-black z-50 border-b border-slate-100 dark:border-slate-900">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <Link
              href={`/studio/${courseId}`}
              className="inline-flex items-center text-sm text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
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
                  strokeWidth={1.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Course
            </Link>

            <div className="flex items-center gap-6">
              <div className="text-sm text-slate-400 dark:text-slate-600">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </div>
              {hasUnsavedChanges && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Unsaved
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={
                  !hasUnsavedChanges || updateExamBankMutation.isPending
                }
                className="rounded-full px-8 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                {updateExamBankMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-12 pb-24">
        <div className="mb-16">
          <input
            type="text"
            value={examBankData.title}
            onChange={(e) => {
              setExamBankData({ ...examBankData, title: e.target.value });
              setHasUnsavedChanges(true);
            }}
            className="text-4xl font-light text-slate-900 dark:text-white tracking-tight bg-transparent border-none focus:outline-none focus:ring-0 w-full mb-6 placeholder-slate-300 dark:placeholder-slate-700"
            placeholder="Exam Bank Title"
          />
          <input
            type="text"
            value={examBankData.description}
            onChange={(e) => {
              setExamBankData({
                ...examBankData,
                description: e.target.value,
              });
              setHasUnsavedChanges(true);
            }}
            className="text-lg text-slate-500 dark:text-slate-400 bg-transparent border-none focus:outline-none focus:ring-0 w-full placeholder-slate-300 dark:placeholder-slate-700"
            placeholder="Add a description..."
          />
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionEditorCard
              key={index}
              index={index}
              question={question}
              onUpdate={(
                field: keyof Question,
                value: string | number | number[] | string[] | undefined
              ) => handleQuestionUpdate(index, field, value)}
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

        <div className="mt-16">
          <button
            onClick={addQuestion}
            className="w-full h-16 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
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
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="font-light">Add Question</span>
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
  onUpdate: (
    field: keyof Question,
    value: string | number | number[] | string[] | undefined
  ) => void;
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
    <div className="bg-white dark:bg-[rgb(10,11,12)] border-b border-slate-100 dark:border-slate-900 px-2">
      <div className="py-6">
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-center gap-6 flex-1">
            <span className="text-sm text-slate-300 dark:text-slate-700 w-6">
              {index + 1}.
            </span>
            <div className="flex-1 min-w-0">
              <textarea
                value={question.question}
                onChange={(e) => onUpdate("question", e.target.value)}
                placeholder="Enter your question here..."
                className="text-lg font-light text-slate-900 dark:text-white bg-transparent border-none focus:outline-none focus:ring-0 w-full whitespace-normal placeholder-slate-300 dark:placeholder-slate-700"
              />
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-slate-400 dark:text-slate-600 whitespace-nowrap">
                  {question.type}
                </span>
                {question.difficulty && (
                  <span className="text-xs text-slate-400 dark:text-slate-600 whitespace-nowrap">
                    {question.difficulty}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors text-slate-400 dark:text-slate-600"
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <button
              onClick={onRemove}
              className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors text-slate-400 dark:text-slate-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-6 pt-6 mt-6 border-t border-slate-100 dark:border-slate-900">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Domain
                </label>
                <select
                  value={question.domainId}
                  onChange={(e) => onUpdate("domainId", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600"
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
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Question Type
                </label>
                <select
                  value={question.type}
                  onChange={(e) => onUpdate("type", e.target.value)}
                  className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600"
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
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
                Answer Options
              </label>
              <div className="space-y-3">
                {question.options.map((option: string, oi: number) => (
                  <div key={oi} className="flex gap-4 items-center">
                    <div className="pt-2">
                      {question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE" ? (
                        <input
                          type="checkbox"
                          checked={isOptionCorrect(oi)}
                          onChange={() => handleCorrectOptionChange(oi)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-0 focus:ring-offset-0"
                        />
                      ) : (
                        <input
                          type="radio"
                          name={`correct-option-${index}`}
                          checked={isOptionCorrect(oi)}
                          onChange={() => handleCorrectOptionChange(oi)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:ring-0 focus:ring-offset-0"
                        />
                      )}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-600 w-4">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => onOptionUpdate(oi, e.target.value)}
                      className="flex-1 px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600 whitespace-normal break-words"
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    />
                    <button
                      onClick={() => onRemoveOption(oi)}
                      disabled={question.options.length <= 1}
                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg transition-colors text-slate-400 dark:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={onAddOption}
                  className="w-full py-3 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-600 dark:hover:text-slate-400 transition-all"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="font-light">Add Option</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Feedback / Explanation
              </label>
              <textarea
                value={question.feedback}
                onChange={(e) => onUpdate("feedback", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600 resize-none whitespace-normal break-words"
                placeholder="Explain why this answer is correct..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={question.difficulty || ""}
                  onChange={(e) =>
                    onUpdate("difficulty", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600"
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Question Category
                </label>
                <select
                  value={question.questionType || ""}
                  onChange={(e) =>
                    onUpdate("questionType", e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-800 text-base focus:outline-none focus:ring-0 focus:border-slate-400 dark:focus:border-slate-600"
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
