"use client";

import { useState, useRef } from "react";
import { useCreateExamBankMutation } from "@/modules/exam-bank/use-exam-bank-mutations";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { Question } from "@/modules/exam-bank/exam-bank.types";
import { Course, Domain } from "@/modules/course/course.types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function AddExamBankPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<
    number | null
  >(null);
  const createExamBankMutation = useCreateExamBankMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: course } = useGetCourseQuery(courseId);
  const domains = course?.domains || [];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      let parsedQuestions: Question[] = [];

      if (fileExtension === "json") {
        const jsonData = JSON.parse(text);
        if (!Array.isArray(jsonData)) {
          throw new Error("JSON must be an array of questions");
        }
        parsedQuestions = jsonData.map((q: any) => {
          const domainId =
            q.domainId || parseDomainId(q.domain || q.domainNumber);
          return { ...q, domainId };
        });
      } else if (fileExtension === "csv") {
        parsedQuestions = parseCSV(text);
      } else {
        throw new Error(
          "Unsupported file type. Please upload a JSON or CSV file.",
        );
      }

      if (parsedQuestions.length === 0) {
        throw new Error("No questions found in file");
      }

      setQuestions(parsedQuestions);
      setShowPreview(true);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to parse file. Please check format.",
      );
      console.error("File upload error:", error);
    }

    e.target.value = "";
  };

  const parseDomainId = (
    domainInput: string | number | undefined,
  ): string | undefined => {
    if (!domainInput) return undefined;

    const inputStr = String(domainInput).trim().toLowerCase();

    for (const domain of domains) {
      if (domain.id === inputStr) {
        return domain.id;
      }
    }

    const selectedDomain = domains?.[parseInt(inputStr) - 1];

    if (selectedDomain) {
      return selectedDomain?.id;
    }
    return undefined;
  };

  const parseCSV = (csvText: string): Question[] => {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const questions: Question[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const question: any = {};
      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/^"|"$/g, "");

        if (header === "options") {
          question[header] = value.split("|").map((opt) => opt.trim());
        } else if (header === "type" && value) {
          question[header] = value.toUpperCase().replace(/ /g, "_");
        } else {
          question[header] = value;
        }
      });

      const domainId =
        question.domainId ||
        parseDomainId(question.domain || question.domainNumber);

      if (question.question && domainId && question.type) {
        questions.push({ ...question, domainId } as Question);
      }
    }

    return questions;
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);

    return result;
  };

  const handleManualJSONUpload = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    try {
      const parsed = JSON.parse(e.target.value);
      if (Array.isArray(parsed)) {
        const questionsWithDomainId = parsed.map((q: any) => {
          const domainId =
            q.domainId || parseDomainId(q.domain || q.domainNumber);
          return { ...q, domainId };
        });
        setQuestions(questionsWithDomainId);
        setShowPreview(true);
      }
    } catch {
      // Silently fail for invalid JSON - don't show preview
    }
  };

  const handleSave = async () => {
    if (!title.trim() || questions.length === 0) {
      alert("Please provide a title and at least one question");
      return;
    }

    try {
      await createExamBankMutation.mutateAsync({
        courseId,
        title,
        description,
        questions,
      });
      router.push(`/studio/${courseId}`);
    } catch (error) {
      console.error("Failed to create exam bank:", error);
      alert("Failed to save exam bank. Please try again.");
    }
  };

  const handleQuestionUpdate = (
    index: number,
    field: keyof Question,
    value: any,
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  const handleOptionUpdate = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, oi) =>
                oi === optionIndex ? value : opt,
              ),
            }
          : q,
      ),
    );
  };

  const addOption = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex && q.options.length > 1
          ? { ...q, options: q.options.filter((_, oi) => oi !== optionIndex) }
          : q,
      ),
    );
  };

  const removeQuestion = (index: number) => {
    if (confirm("Are you sure you want to remove this question?")) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
      // Reset expanded index if the removed question was expanded
      if (expandedQuestionIndex === index) {
        setExpandedQuestionIndex(null);
      } else if (
        expandedQuestionIndex !== null &&
        expandedQuestionIndex > index
      ) {
        setExpandedQuestionIndex(expandedQuestionIndex - 1);
      }
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
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <Link
                href={`/studio/${courseId}`}
                className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-2"
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
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Preview Questions ({questions.length})
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
                Review and edit your questions before saving
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="rounded-xl"
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
                  d="M11 17l-5-5m0 0l5-5m-5 5h12"
                />
              </svg>
              Back to Upload
            </Button>
          </div>

          <div className="bg-white dark:bg-[rgb(10,11,12)] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {questions.map((question, index) => (
                <QuestionEditorCard
                  key={index}
                  index={index}
                  question={question}
                  onUpdate={(field: keyof Question, value: any) =>
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
                      expandedQuestionIndex === index ? null : index,
                    )
                  }
                  domains={domains}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <Button
              onClick={addQuestion}
              variant="outline"
              className="w-full h-16 text-lg rounded-xl border-2 border-dashed"
            >
              <svg
                className="w-6 h-6 mr-2"
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
              Add Question
            </Button>
          </div>

          <div className="bg-white dark:bg-[rgb(10,11,12)] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Exam Bank Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter exam bank title..."
                  className="w-full px-5 py-4 text-lg bg-white dark:bg-[rgb(10,11,12)] border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description..."
                  rows={3}
                  className="w-full px-5 py-4 text-base bg-white dark:bg-[rgb(10,11,12)] border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/studio/${courseId}`)}
                  className="rounded-xl px-8 py-4 text-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={createExamBankMutation.isPending || !title.trim()}
                  className="rounded-xl px-8 py-4 text-lg shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50"
                >
                  {createExamBankMutation.isPending
                    ? "Saving..."
                    : `Save Exam Bank (${questions.length} questions)`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href={`/studio/${courseId}`}
            className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-2"
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
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bulk Upload Exam Bank
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">
            Upload a JSON or CSV file containing your questions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors bg-white dark:bg-[rgb(10,11,12)] hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/20 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Upload File
            </p>
            <p className="text-base text-slate-600 dark:text-slate-400">
              JSON or CSV format
            </p>
          </div>

          <div className="bg-white dark:bg-[rgb(10,11,12)] rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-3 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              File Format Guide
            </h3>
            <div className="space-y-4 text-base text-slate-600 dark:text-slate-400">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-2">
                  JSON Format:
                </p>
                <p className="text-sm">
                  Array of question objects with fields: domainId (or
                  domain/domainNumber), question, options, type, feedback,
                  difficulty, questionType, correctOptionIndex (for single
                  select/true-false) or correctOptionIndexes (for multiple
                  select)
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white mb-2">
                  CSV Format:
                </p>
                <p className="text-sm">
                  Comma-separated with columns: domainId (or
                  domain/domainNumber), question, options (| separated), type,
                  feedback, difficulty, questionType, correctOptionIndex,
                  correctOptionIndexes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[rgb(10,11,12)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            Or Paste JSON
          </h3>
          <textarea
            placeholder={`[
  {
    "domain": "Domain 1",
    "question": "What is 2 + 2?",
    "options": ["3", "4", "5", "6"],
    "type": "SINGLE_SELECT_MULTIPLE_CHOICE",
    "feedback": "2 + 2 = 4",
    "difficulty": "easy",
    "questionType": "definition",
    "correctOptionIndex": 1
  }
]`}
            rows={12}
            onChange={handleManualJSONUpload}
            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all resize-none font-mono text-sm"
          />
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
  onUpdate: (field: keyof Question, value: any) => void;
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
        newIndexes.length > 0 ? newIndexes : undefined,
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
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {index + 1}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">
                {question.question || "(No question text)"}
              </h3>
              <div className="flex items-center gap-3 text-sm">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full">
                  {question.type}
                </span>
                {question.difficulty && (
                  <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                    {question.difficulty}
                  </span>
                )}
                {question.questionType && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                    {question.questionType}
                  </span>
                )}
                <span className="text-slate-500 dark:text-slate-400">
                  {question.options.length} option
                  {question.options.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <svg
                className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
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
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Domain
                </label>
                <select
                  value={question.domainId}
                  onChange={(e) => onUpdate("domainId", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
                  required
                >
                  {domains && domains.length > 0 ? (
                    <>
                      <option value="">Select domain</option>
                      {domains.map((domain) => (
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
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Question Type
                </label>
                <select
                  value={question.type}
                  onChange={(e) => onUpdate("type", e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
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

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Question Text
              </label>
              <textarea
                value={question.question}
                onChange={(e) => onUpdate("question", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 resize-none"
                placeholder="Enter your question here..."
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                Answer Options
              </label>
              <div className="space-y-3">
                {question.options.map((option, oi) => (
                  <div key={oi} className="flex gap-3 items-start">
                    <div className="pt-3">
                      {question.type === "MULTIPLE_SELECT_MULTIPLE_CHOICE" ? (
                        <input
                          type="checkbox"
                          checked={isOptionCorrect(oi)}
                          onChange={() => handleCorrectOptionChange(oi)}
                          className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
                        />
                      ) : (
                        <input
                          type="radio"
                          name={`correct-option-${index}`}
                          checked={isOptionCorrect(oi)}
                          onChange={() => handleCorrectOptionChange(oi)}
                          className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
                        />
                      )}
                    </div>
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {String.fromCharCode(65 + oi)}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => onOptionUpdate(oi, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveOption(oi)}
                      disabled={question.options.length <= 1}
                      className="rounded-lg"
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
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={onAddOption}
                  className="w-full h-12 text-base border-dashed rounded-xl"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Option
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Feedback / Explanation
              </label>
              <textarea
                value={question.feedback}
                onChange={(e) => onUpdate("feedback", e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 resize-none"
                placeholder="Explain why this answer is correct..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Difficulty Level
                </label>
                <select
                  value={question.difficulty || ""}
                  onChange={(e) =>
                    onUpdate("difficulty", e.target.value || undefined)
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
                >
                  <option value="">Select difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                  Question Category
                </label>
                <select
                  value={question.questionType || ""}
                  onChange={(e) =>
                    onUpdate("questionType", e.target.value || undefined)
                  }
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400"
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
