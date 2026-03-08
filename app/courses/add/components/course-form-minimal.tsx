"use client";

import { Button } from "@/components/ui/button";
import { CourseFormData, CourseType } from "@/modules/course/course.types";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Target,
  FileText,
  ClipboardCheck,
  Check,
  X,
  Plus,
  Clock,
  Award,
} from "lucide-react";

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
  submitButtonTitle: string;
}

export function CourseFormMinimal({
  formData,
  setFormData,
  currentStep,
  onNext,
  onBack,
  onSubmit,
  isSubmitting,
  isValid,
  totalSteps,
  submitButtonTitle,
}: CourseFormProps) {
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
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-2xl mx-auto py-12"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-16"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-foreground/60" />
          </div>
        </div>
        <h2 className="text-3xl font-light text-center text-foreground mb-4">
          Let's start with a title
        </h2>
        <p className="text-center text-muted-foreground">
          What would you like to call your course?
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-20"
      >
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Introduction to Advanced Mathematics"
          className="w-full text-2xl md:text-3xl font-light bg-transparent border-0 border-b-2 border-border focus:outline-none focus:border-foreground text-foreground placeholder:text-foreground/30 py-4 transition-colors"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-20"
      >
        <h3 className="text-xl font-light text-center text-foreground mb-4">
          Describe your course
        </h3>
        <p className="text-center text-muted-foreground mb-6">
          What will students learn?
        </p>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="A brief description of the course content and objectives..."
          rows={4}
          className="w-full text-lg font-light bg-transparent border-0 border-b-2 border-border focus:outline-none focus:border-foreground text-foreground placeholder:text-foreground/30 py-4 transition-colors resize-none"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-light text-center text-foreground mb-6">
          What's the difficulty level?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {["beginner", "intermediate", "advanced", "professional"].map(
            (type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    courseType: type as CourseType,
                  })
                }
                className={`p-6 text-sm font-medium rounded-2xl border-2 transition-all capitalize hover:border-foreground/40 ${
                  formData.courseType === type
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground/70"
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <button
          type="button"
          onClick={() =>
            setFormData({
              ...formData,
              hasCertification: !formData.hasCertification,
            })
          }
          className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${
            formData.hasCertification
              ? "border-foreground bg-foreground/5"
              : "border-border hover:border-foreground/30"
          }`}
        >
          <Award className="w-6 h-6" />
          <span className="text-base">
            {formData.hasCertification
              ? "Includes certification"
              : "No certification"}
          </span>
        </button>
      </motion.div>
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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl mx-auto py-12"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center">
              <Target className="w-8 h-8 text-foreground/60" />
            </div>
          </div>
          <h2 className="text-3xl font-light text-foreground mb-4">
            What are the main topics?
          </h2>
          <p className="text-muted-foreground">
            Add domains to organize your course content
          </p>
        </motion.div>

        <div className="space-y-6 mb-12">
          {formData.domains.map((domain, index) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <input
                type="text"
                value={domain.name}
                onChange={(e) => updateDomainName(domain.id, e.target.value)}
                placeholder={`Domain ${index + 1}`}
                className="w-full text-xl font-light bg-background border-2 border-border rounded-2xl px-6 py-5 focus:outline-none focus:border-foreground text-foreground placeholder:text-foreground/30 transition-colors pr-14"
              />
              <button
                onClick={() => removeDomain(domain.id)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-foreground/5 rounded-lg"
              >
                <X className="w-5 h-5 text-foreground/50" />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={addDomain}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full p-6 rounded-2xl border-2 border-dashed border-border hover:border-foreground/40 transition-all flex items-center justify-center gap-3 text-foreground/70 hover:text-foreground"
        >
          <Plus className="w-6 h-6" />
          <span className="text-base">Add another domain</span>
        </motion.button>
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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl mx-auto py-12"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-foreground/60" />
            </div>
          </div>
          <h2 className="text-3xl font-light text-foreground mb-4">
            Add chapters to each domain
          </h2>
          <p className="text-muted-foreground">
            Break down your content into manageable sections
          </p>
        </motion.div>

        <div className="space-y-12">
          {formData.domains.map((domain, domainIndex) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: domainIndex * 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-light text-muted-foreground px-2">
                {domain.name || `Domain ${domainIndex + 1}`}
              </h3>

              <div className="space-y-3">
                {domain.chapters.map((chapter, chapterIndex) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: domainIndex * 0.1 + chapterIndex * 0.05,
                    }}
                    className="group relative"
                  >
                    <input
                      type="text"
                      value={chapter.name}
                      onChange={(e) =>
                        updateChapterName(domain.id, chapter.id, e.target.value)
                      }
                      placeholder={`Chapter ${chapterIndex + 1}`}
                      className="w-full text-lg font-light bg-background border border-border rounded-xl px-5 py-4 focus:outline-none focus:border-foreground text-foreground placeholder:text-foreground/30 transition-colors pr-12"
                    />
                    <button
                      onClick={() => removeChapter(domain.id, chapter.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-foreground/5 rounded-lg"
                    >
                      <X className="w-4 h-4 text-foreground/50" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addChapter(domain.id)}
                className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-foreground/30 transition-all flex items-center justify-center gap-2 text-foreground/60 hover:text-foreground text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add chapter</span>
              </button>
            </motion.div>
          ))}
        </div>
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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl mx-auto py-12"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center">
              <ClipboardCheck className="w-8 h-8 text-foreground/60" />
            </div>
          </div>
          <h2 className="text-3xl font-light text-foreground mb-4">
            Configure your exam
          </h2>
          <p className="text-muted-foreground">
            Set up the assessment parameters
          </p>
        </motion.div>

        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-foreground/40 mr-3" />
              <label className="text-lg font-light text-foreground">
                How many questions?
              </label>
            </div>
            <input
              type="number"
              min="1"
              value={formData.exam.totalQuestions || ""}
              onChange={(e) => updateTotalQuestions(e.target.value)}
              placeholder="Enter number of questions"
              className="w-full text-3xl font-light bg-background border-2 border-border rounded-2xl px-6 py-6 focus:outline-none focus:border-foreground text-foreground placeholder:text-foreground/20 text-center transition-colors"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-foreground/40 mr-3" />
              <label className="text-lg font-light text-foreground">
                Time limit (minutes)?
              </label>
            </div>
            <input
              type="number"
              min="1"
              value={formData.exam.totalTimeMinutes || ""}
              onChange={(e) => updateTotalTime(e.target.value)}
              placeholder="Enter time in minutes"
              className="w-full text-3xl font-light bg-background border-2 border-border rounded-2xl px-6 py-6 focus:outline-none focus:border-foreground text-foreground placeholder:text-foreground/20 text-center transition-colors"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-light text-center text-foreground mb-8">
              Weight distribution
            </h3>
            <div className="space-y-4">
              {formData.domains.map((domain, index) => (
                <div key={domain.id}>
                  <label className="block text-sm text-muted-foreground mb-2 px-2">
                    {domain.name || `Domain ${index + 1}`}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.exam.domainWeights[domain.id] || ""}
                      onChange={(e) =>
                        updateDomainWeight(domain.id, e.target.value)
                      }
                      placeholder="0"
                      className="w-full text-2xl font-light bg-background border border-border rounded-xl px-5 py-4 focus:outline-none focus:border-foreground text-foreground placeholder:text-foreground/20 text-center transition-colors"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-foreground/40 font-light">
                      %
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`mt-8 p-6 rounded-2xl border-2 text-center ${
                totalWeight === 100
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-amber-500/30 bg-amber-500/5"
              }`}
            >
              <p className="text-lg font-light">
                Total weight:{" "}
                <span
                  className={
                    totalWeight === 100
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-600 dark:text-amber-400"
                  }
                >
                  {totalWeight}%
                </span>
              </p>
              {totalWeight !== 100 && (
                <p className="text-sm text-muted-foreground mt-2">
                  should be 100%
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              type="button"
              onClick={() =>
                updateAllowSkipQuestions(!formData.exam.allowSkipQuestions)
              }
              className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-center gap-4 ${
                formData.exam.allowSkipQuestions
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <Check className="w-6 h-6" />
              <span className="text-base font-light">
                {formData.exam.allowSkipQuestions
                  ? "Allow skipping questions"
                  : "Don't allow skipping questions"}
              </span>
            </button>
          </motion.div>
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
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl mx-auto py-12"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center">
              <Check className="w-8 h-8 text-foreground/60" />
            </div>
          </div>
          <h2 className="text-3xl font-light text-foreground mb-4">
            Almost there
          </h2>
          <p className="text-muted-foreground">
            Review your course before creating
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-2xl border border-border bg-background/50"
          >
            <h3 className="text-lg font-medium text-foreground mb-6">
              Course Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Title
                </label>
                <p className="mt-1 text-xl font-light text-foreground">
                  {formData.title || "Not set"}
                </p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Description
                </label>
                <p className="mt-1 text-base text-foreground/80">
                  {formData.description || "Not set"}
                </p>
              </div>
              <div className="flex gap-8">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Type
                  </label>
                  <p className="mt-1 text-base capitalize text-foreground">
                    {formData.courseType}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Certification
                  </label>
                  <p
                    className={`mt-1 text-base ${
                      formData.hasCertification
                        ? "text-green-600 dark:text-green-400"
                        : "text-foreground/60"
                    }`}
                  >
                    {formData.hasCertification ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-2xl border border-border bg-background/50"
          >
            <h3 className="text-lg font-medium text-foreground mb-6">
              Structure
            </h3>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center p-6 rounded-xl bg-foreground/5">
                <p className="text-4xl font-light text-foreground mb-2">
                  {formData.domains.length}
                </p>
                <p className="text-sm text-muted-foreground">Domains</p>
              </div>
              <div className="text-center p-6 rounded-xl bg-foreground/5">
                <p className="text-4xl font-light text-foreground mb-2">
                  {totalChapters}
                </p>
                <p className="text-sm text-muted-foreground">Chapters</p>
              </div>
            </div>

            <div className="space-y-3">
              {formData.domains.map((domain, index) => (
                <div
                  key={domain.id}
                  className="p-4 rounded-xl bg-background border border-border"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">
                      {domain.name || `Domain ${index + 1}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {domain.chapters.length} chapter
                      {domain.chapters.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-2xl border border-border bg-background/50"
          >
            <h3 className="text-lg font-medium text-foreground mb-6">
              Exam Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <span className="text-foreground/70">Questions</span>
                <span className="text-xl font-light text-foreground">
                  {formData.exam.totalQuestions || 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <span className="text-foreground/70">Time limit</span>
                <span className="text-xl font-light text-foreground">
                  {formData.exam.totalTimeMinutes || 0} min
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-foreground/70">Skip allowed</span>
                <span className="text-xl font-light text-foreground">
                  {formData.exam.allowSkipQuestions ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={currentStep === 1}
            className="text-foreground/70 hover:text-foreground"
          >
            Back
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {currentStep} of {totalSteps}
            </span>

            {currentStep === totalSteps ? (
              <Button
                onClick={onSubmit}
                disabled={!isValid || isSubmitting}
                size="lg"
                className="px-8"
              >
                {isSubmitting ? "Creating..." : "Create Course"}
              </Button>
            ) : (
              <Button
                onClick={onNext}
                disabled={!isValid}
                size="lg"
                className="px-8"
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
