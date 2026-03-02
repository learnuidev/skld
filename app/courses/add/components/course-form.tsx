"use client";

import { Button } from "@/components/ui/button";
import { CourseFormData } from "@/modules/course/course.types";
import { motion, AnimatePresence } from "framer-motion";

interface CourseFormProps {
  formData: CourseFormData;
  setFormData: (data: CourseFormData) => void;
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
  totalSteps: number;
}

export function CourseForm({
  formData,
  setFormData,
  currentStep,
  onNext,
  onBack,
  onSubmit,
  isSubmitting,
  isValid,
  totalSteps,
}: CourseFormProps) {
  const stepTitles = [
    "Course Overview",
    "Add Domains",
    "Add Chapters",
    "Exam Configuration",
    "Course Summary",
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderDomains();
      case 3:
        return renderChapters();
      case 4:
        return renderExamConfig();
      case 5:
        return renderSummary();
      default:
        return null;
    }
  };

  const renderBasicInfo = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Course Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter your course title..."
          className="w-full px-5 py-4 text-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Course Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe what students will learn..."
          rows={6}
          className="w-full px-5 py-4 text-base bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
          Course Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          {["basic", "intermediate", "advanced", "professional"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  courseType: type as
                    | "basic"
                    | "intermediate"
                    | "advanced"
                    | "professional",
                })
              }
              className={`px-5 py-4 text-sm font-medium rounded-xl border-2 transition-all capitalize ${
                formData.courseType === type
                  ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
              Feature Certification
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Students receive a certificate upon completion
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                hasCertification: !formData.hasCertification,
              })
            }
            className={`relative inline-flex h-12 w-20 items-center rounded-full transition-colors ${
              formData.hasCertification
                ? "bg-green-500"
                : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform ${
                formData.hasCertification ? "translate-x-9" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderDomains = () => {
    const addDomain = () => {
      const newDomain = {
        id: `domain-${Date.now()}`,
        name: "",
        chapters: [],
      };
      setFormData({
        ...formData,
        domains: [...formData.domains, newDomain],
      });
    };

    const removeDomain = (domainId: string) => {
      setFormData({
        ...formData,
        domains: formData.domains.filter((d) => d.id !== domainId),
      });
    };

    const updateDomainName = (domainId: string, name: string) => {
      setFormData({
        ...formData,
        domains: formData.domains.map((d) =>
          d.id === domainId ? { ...d, name } : d
        ),
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {formData.domains.map((domain, index) => (
          <div
            key={domain.id}
            className="group bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-300">
                {index + 1}
              </span>
              <input
                type="text"
                value={domain.name}
                onChange={(e) => updateDomainName(domain.id, e.target.value)}
                placeholder="Domain name..."
                className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-base placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeDomain(domain.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
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
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addDomain}
          className="w-full py-6 text-base font-semibold border-dashed border-2 hover:border-solid transition-all"
        >
          <svg
            className="w-5 h-5 mr-2"
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
          Add Domain
        </Button>
      </motion.div>
    );
  };

  const renderChapters = () => {
    const addChapter = (domainId: string) => {
      const newChapter = {
        id: `chapter-${Date.now()}`,
        name: "",
      };
      setFormData({
        ...formData,
        domains: formData.domains.map((d) =>
          d.id === domainId
            ? { ...d, chapters: [...d.chapters, newChapter] }
            : d
        ),
      });
    };

    const removeChapter = (domainId: string, chapterId: string) => {
      setFormData({
        ...formData,
        domains: formData.domains.map((d) =>
          d.id === domainId
            ? { ...d, chapters: d.chapters.filter((c) => c.id !== chapterId) }
            : d
        ),
      });
    };

    const updateChapterName = (
      domainId: string,
      chapterId: string,
      name: string
    ) => {
      setFormData({
        ...formData,
        domains: formData.domains.map((d) =>
          d.id === domainId
            ? {
                ...d,
                chapters: d.chapters.map((c) =>
                  c.id === chapterId ? { ...c, name } : c
                ),
              }
            : d
        ),
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {formData.domains.map((domain, domainIndex) => (
          <div key={domain.id} className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white px-2">
              {domain.name || `Domain ${domainIndex + 1}`}
            </h3>

            {domain.chapters.map((chapter, chapterIndex) => (
              <div
                key={chapter.id}
                className="group bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {chapterIndex + 1}
                  </span>
                  <input
                    type="text"
                    value={chapter.name}
                    onChange={(e) =>
                      updateChapterName(domain.id, chapter.id, e.target.value)
                    }
                    placeholder="Chapter name..."
                    className="flex-1 px-4 py-2.5 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeChapter(domain.id, chapter.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      className="w-3.5 h-3.5"
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
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => addChapter(domain.id)}
              className="w-full border-dashed border-2 hover:border-solid"
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
              Add Chapter
            </Button>
          </div>
        ))}
      </motion.div>
    );
  };

  const renderExamConfig = () => {
    const updateTotalQuestions = (value: string) => {
      setFormData({
        ...formData,
        exam: { ...formData.exam, totalQuestions: parseInt(value) || 0 },
      });
    };

    const updateTotalTime = (value: string) => {
      setFormData({
        ...formData,
        exam: { ...formData.exam, totalTimeMinutes: parseInt(value) || 0 },
      });
    };

    const updateDomainWeight = (domainId: string, weight: string) => {
      setFormData({
        ...formData,
        exam: {
          ...formData.exam,
          domainWeights: {
            ...formData.exam.domainWeights,
            [domainId]: parseInt(weight) || 0,
          },
        },
      });
    };

    const updateAllowSkipQuestions = (checked: boolean) => {
      setFormData({
        ...formData,
        exam: { ...formData.exam, allowSkipQuestions: checked },
      });
    };

    const totalWeight = Object.values(formData.exam.domainWeights).reduce(
      (a, b) => a + b,
      0
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Total Exam Questions
          </label>
          <input
            type="number"
            min="1"
            value={formData.exam.totalQuestions || ""}
            onChange={(e) => updateTotalQuestions(e.target.value)}
            placeholder="Enter total number of questions..."
            className="w-full px-5 py-4 text-lg bg-transparent border-0 focus:outline-none focus:ring-0 text-base placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
            Total Exam Time (in minutes)
          </label>
          <input
            type="number"
            min="1"
            value={formData.exam.totalTimeMinutes || ""}
            onChange={(e) => updateTotalTime(e.target.value)}
            placeholder="Enter total exam time in minutes..."
            className="w-full px-5 py-4 text-lg bg-transparent border-0 focus:outline-none focus:ring-0 text-base placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Exam Weight per Domain
          </h3>

          {formData.domains.map((domain, index) => (
            <div
              key={domain.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700"
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {domain.name || `Domain ${index + 1}`}
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.exam.domainWeights[domain.id] || ""}
                    onChange={(e) =>
                      updateDomainWeight(domain.id, e.target.value)
                    }
                    placeholder="0"
                    className="w-full px-4 py-3 text-lg bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>
                <span className="text-slate-400 font-medium">%</span>
              </div>
            </div>
          ))}

          <div
            className={`p-4 rounded-lg border-2 ${
              totalWeight === 100
                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
            }`}
          >
            <p className="text-center font-semibold">
              Total Weight:{" "}
              <span
                className={
                  totalWeight === 100
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                }
              >
                {totalWeight}%
              </span>
              {totalWeight !== 100 && " (should be 100%)"}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                Allow Skip Questions
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Students can skip questions and return to them later
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateAllowSkipQuestions(!formData.exam.allowSkipQuestions)
              }
              className={`relative inline-flex h-12 w-20 items-center rounded-full transition-colors ${
                formData.exam.allowSkipQuestions
                  ? "bg-green-500"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}
            >
              <span
                className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform ${
                  formData.exam.allowSkipQuestions
                    ? "translate-x-9"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSummary = () => {
    const totalChapters = formData.domains.reduce(
      (sum, d) => sum + d.chapters.length,
      0
    );

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Course Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Title
              </label>
              <p className="mt-1 text-base font-medium text-slate-900 dark:text-white">
                {formData.title || "Not set"}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Description
              </label>
              <p className="mt-1 text-base text-slate-700 dark:text-slate-300">
                {formData.description || "Not set"}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Course Type
              </label>
              <p className="mt-1 text-base font-medium text-slate-900 dark:text-white capitalize">
                {formData.courseType}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Certification
              </label>
              <span
                className={`text-sm font-semibold ${
                  formData.hasCertification
                    ? "text-green-600 dark:text-green-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {formData.hasCertification ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Structure Overview
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {formData.domains.length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Domains
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {totalChapters}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Chapters
                </p>
              </div>
            </div>

            {formData.domains.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Domains & Chapters
                </h4>
                {formData.domains.map((domain, domainIndex) => (
                  <div
                    key={domain.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <h5 className="font-medium text-slate-900 dark:text-white">
                        {domain.name || `Domain ${domainIndex + 1}`}
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {domain.chapters.length} chapter
                        {domain.chapters.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {domain.chapters.length > 0 && (
                      <div className="p-4 space-y-2">
                        {domain.chapters.map((chapter, chapterIndex) => (
                          <div key={chapter.id} className="text-sm">
                            <p className="font-medium text-slate-700 dark:text-slate-300">
                              {chapter.name || `Chapter ${chapterIndex + 1}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Exam Configuration
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Total Questions
              </span>
              <span className="text-base font-semibold text-slate-900 dark:text-white">
                {formData.exam.totalQuestions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Total Time (minutes)
              </span>
              <span className="text-base font-semibold text-slate-900 dark:text-white">
                {formData.exam.totalTimeMinutes || 0}
              </span>
            </div>

            {Object.keys(formData.exam.domainWeights).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Domain Weights
                </h4>
                <div className="space-y-2">
                  {formData.domains.map((domain) => {
                    const weight = formData.exam.domainWeights[domain.id];
                    if (!weight) return null;

                    return (
                      <div
                        key={domain.id}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {domain.name || "Untitled"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {weight}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Skip Questions
              </span>
              <span
                className={`text-sm font-semibold ${
                  formData.exam.allowSkipQuestions
                    ? "text-green-600 dark:text-green-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {formData.exam.allowSkipQuestions ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
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
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-300">
                Review your course
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                Click on any section in the sidebar to make changes. When
                you&apos;re ready, click &quot;Create Course&quot; to publish.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {stepTitles[currentStep - 1]}
        </h2>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={currentStep === 1}>
          Back
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Step {currentStep} of {totalSteps}
          </span>

          {currentStep === totalSteps ? (
            <Button
              onClick={onSubmit}
              disabled={!isValid || isSubmitting}
              size="lg"
            >
              {isSubmitting ? "Creating Course..." : "Create Course"}
            </Button>
          ) : (
            <Button onClick={onNext} disabled={!isValid} size="lg">
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
