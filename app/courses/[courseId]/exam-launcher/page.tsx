"use client";

import { useState, useEffect, useRef } from "react";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetExamBanksQuery } from "@/modules/exam-bank/use-get-exam-bank-query";
import { useCreateMockExamMutation } from "@/modules/user-mock-exams/use-create-mock-exam-mutation";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  Clock,
  Play,
  ArrowLeft,
  TimerOff,
  Timer,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

export default function ExamLauncherPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(
    new Set()
  );
  const [selectedExamBanks, setSelectedExamBanks] = useState<Set<string>>(
    new Set()
  );
  const [examType, setExamType] = useState<"timed" | "untimed">("timed");
  const [isExamBankDropdownOpen, setIsExamBankDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsExamBankDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    params.courseId
  );
  const { data: examBanks, isLoading: examBanksLoading } = useGetExamBanksQuery(
    params.courseId
  );
  const createMockExamMutation = useCreateMockExamMutation();

  const isLoading = courseLoading || examBanksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading exam...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">Course not found</div>
      </div>
    );
  }

  const toggleDomain = (domainId: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(domainId)) {
      newSelected.delete(domainId);
    } else {
      newSelected.add(domainId);
    }
    setSelectedDomains(newSelected);
  };

  const toggleExamBank = (examBankId: string) => {
    const newSelected = new Set(selectedExamBanks);
    if (newSelected.has(examBankId)) {
      newSelected.delete(examBankId);
    } else {
      newSelected.add(examBankId);
    }
    setSelectedExamBanks(newSelected);
    // Clear domains when exam bank selection changes
    setSelectedDomains(new Set());
  };

  const getSelectedExamBanks = () => {
    const banks = examBanks || [];
    if (selectedExamBanks.size === 0) return banks;
    return banks.filter((bank) => selectedExamBanks.has(bank.id));
  };

  const getSelectedQuestions = () => {
    if (!examBanks || examBanks.length === 0) return 0;

    const selectedBanks = getSelectedExamBanks();
    let totalQuestions = 0;

    selectedBanks.forEach((bank) => {
      bank.questions.forEach((question) => {
        if (
          selectedDomains.size === 0 ||
          selectedDomains.has(question.domainId)
        ) {
          totalQuestions += 1;
        }
      });
    });
    return totalQuestions;
  };

  const getUniqueDomainsFromSelectedBanks = () => {
    const selectedBanks = getSelectedExamBanks();
    const domainSet = new Set<string>();

    selectedBanks.forEach((bank) => {
      bank.questions.forEach((question) => {
        if (question.domainId) {
          domainSet.add(question.domainId);
        }
      });
    });

    return Array.from(domainSet);
  };

  const getEstimatedTime = () => {
    if (!course.exam || !course.exam.totalTimeMinutes) return 0;

    if (course.exam.totalTimeMinutes) {
      return course.exam.totalTimeMinutes;
    }
    const totalQuestions = getSelectedQuestions();
    const totalCourseQuestions = course.exam.totalQuestions;
    if (totalCourseQuestions === 0) return 0;

    const timePerQuestion = course.exam.totalTimeMinutes / totalCourseQuestions;
    return Math.round(timePerQuestion * totalQuestions);
  };

  const handleStartExam = async () => {
    if (!course?.exam) return;

    const totalTimeSeconds =
      examType === "timed" && course.exam.totalTimeMinutes
        ? course.exam.totalTimeMinutes * 60
        : 0;

    try {
      const mockExam = await createMockExamMutation.mutateAsync({
        courseId: params.courseId,
        examType,
        selectedDomains: Array.from(selectedDomains),
        totalTimeSeconds,
      });

      router.push(`/courses/${params.courseId}/mock-exam/${mockExam.id}`);
    } catch (error) {
      console.error("Failed to start exam:", error);
    }
  };

  const totalQuestions = getSelectedQuestions();
  const estimatedTime = getEstimatedTime();

  return (
    <div className="min-h-screen bg-background">
      <div className="pb-16 lg:pb-24 pt-12 max-w-3xl">
        {/* Back Button */}
        <Link
          href={`/courses/${params.courseId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Link>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">
            Exam Launcher
          </h1>
          <p className="text-muted-foreground text-lg">{course.title}</p>
        </header>

        {/* Exam Type Selection */}
        <div className="mb-12">
          <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
            Exam Type
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setExamType("timed")}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                examType === "timed"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <Timer className="w-6 h-6" />
                <span className="text-lg font-medium">Timed</span>
              </div>
              <p className="text-sm opacity-90">
                Complete the exam within the time limit
              </p>
              {course.exam?.totalTimeMinutes && (
                <p className="text-sm mt-2 opacity-75">
                  Total time: {estimatedTime} minutes
                </p>
              )}
            </button>
            <button
              onClick={() => setExamType("untimed")}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                examType === "untimed"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground/30"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <TimerOff className="w-6 h-6" />
                <span className="text-lg font-medium">Untimed</span>
              </div>
              <p className="text-sm opacity-90">
                Take your time, no time limit
              </p>
              <p className="text-sm mt-2 opacity-75">
                {totalQuestions} questions
              </p>
            </button>
          </div>
        </div>

        {/* Test Bank Selection */}
        {examBanks && examBanks.length > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
              Select Test Banks
              <span className="ml-2 text-xs font-normal">(optional)</span>
            </h2>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() =>
                  setIsExamBankDropdownOpen(!isExamBankDropdownOpen)
                }
                className="w-full flex items-center justify-between p-5 rounded-xl border-2 border-border hover:border-foreground/30 transition-all text-left"
              >
                <span className="text-base">
                  {selectedExamBanks.size === 0
                    ? "All Test Banks"
                    : `${selectedExamBanks.size} Test Bank${selectedExamBanks.size === 1 ? "" : "s"} Selected`}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    isExamBankDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExamBankDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-background border border-border rounded-xl shadow-lg">
                  <button
                    onClick={() => {
                      setSelectedExamBanks(new Set());
                      setIsExamBankDropdownOpen(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-secondary/50 transition-colors text-sm"
                  >
                    All Test Banks
                  </button>
                  {examBanks.map((bank) => {
                    const isSelected = selectedExamBanks.has(bank.id);
                    return (
                      <button
                        key={bank.id}
                        onClick={() => toggleExamBank(bank.id)}
                        className="w-full flex items-center justify-between text-left px-5 py-3 hover:bg-secondary/50 transition-colors text-sm"
                      >
                        <span>{bank.title}</span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Domain Selection */}
        {selectedExamBanks.size > 0 && (
          <div className="mb-12">
            <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-6">
              Select Domains
              <span className="ml-2 text-xs font-normal">(optional)</span>
            </h2>
            <div className="space-y-3">
              {getUniqueDomainsFromSelectedBanks().map((domainId) => {
                const domain = course.domains?.find((d) => d.id === domainId);
                if (!domain) return null;

                const isSelected = selectedDomains.has(domain.id);
                const isAllSelected = selectedDomains.size === 0;

                const getDomainQuestionCount = () => {
                  if (!examBanks || examBanks.length === 0) return 0;
                  let count = 0;
                  getSelectedExamBanks().forEach((bank) => {
                    bank.questions.forEach((question) => {
                      if (question.domainId === domain.id) {
                        count += 1;
                      }
                    });
                  });
                  return count;
                };

                const questionCount = getDomainQuestionCount();

                return (
                  <button
                    key={domain.id}
                    onClick={() => toggleDomain(domain.id)}
                    className={`w-full flex items-start gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                      isSelected || isAllSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        isSelected || isAllSelected
                          ? "border-background bg-background"
                          : "border-foreground"
                      }`}
                    >
                      {(isSelected || isAllSelected) && (
                        <Check className="w-4 h-4 text-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium mb-1">
                        {domain.name}
                      </h3>
                      {domain.chapters && domain.chapters.length > 0 && (
                        <p className="text-sm opacity-90 mb-2">
                          {domain.chapters.length} chapters
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm opacity-75">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{questionCount} questions</span>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Leave all domains unselected to include all questions from
              selected test banks
            </p>
          </div>
        )}

        {/* Start Button */}
        <div className="pt-8 border-t border-border">
          <button
            onClick={handleStartExam}
            disabled={totalQuestions === 0 || createMockExamMutation.isPending}
            className="w-full sm:w-auto px-12 py-4 bg-foreground text-background rounded-xl font-medium text-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            {createMockExamMutation.isPending
              ? "Creating Exam..."
              : `Start ${examType === "timed" ? "Timed" : "Untimed"} Exam`}
          </button>
          {totalQuestions === 0 && (
            <p className="text-sm text-destructive mt-3">
              No exam questions available for this course
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
