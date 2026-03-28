import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { EnrollmentStatsResponse } from "@/modules/enrollment/enrollment.types";
import { CourseContent } from "@/modules/course-content/course-content.types";

interface Domain {
  id: string;
  name: string;
  chapters: Array<{ id: string; name: string }>;
}

interface ProgressByDomainChartProps {
  courseId: string;
  domains: Domain[] | undefined;
  expandedDomain: string | null;
  setExpandedDomain: (domainId: string | null) => void;
  enrollmentStats: EnrollmentStatsResponse | undefined;
  courseContents: CourseContent[] | undefined;
}

export function ProgressByDomainChart({
  courseId,
  domains,
  expandedDomain,
  setExpandedDomain,
  enrollmentStats,
  courseContents,
}: ProgressByDomainChartProps) {
  const calculateDomainProgress = (domain: Domain) => {
    if (!enrollmentStats || !courseContents)
      return {
        total: 0,
        completed: 0,
        percentage: 0,
        questionsAnswered: 0,
        performancePercentage: 0,
        totalTimeSpent: 0,
        coveragePercentage: 0,
        averageContentDepth: 0,
      };

    const chapterIds = domain.chapters.map((chapter) => chapter.id);
    const domainContents = courseContents.filter((content) =>
      chapterIds.includes(content.chapterId || "")
    );
    const totalContents = domainContents.length;
    const domainStats = enrollmentStats.enrollmentStats.filter((stat) =>
      domainContents.some((c) => c.id === stat.contentId)
    );
    const completedContents = domainStats.length;

    const totalQuestionsAnswered = domainStats.reduce(
      (sum: number, stat) =>
        sum +
        (stat.metadata.totalCorrect || 0) +
        (stat.metadata.totalIncorrect || 0),
      0
    );

    const totalCorrect = domainStats.reduce(
      (sum: number, stat) => sum + (stat.metadata.totalCorrect || 0),
      0
    );

    const performancePercentage =
      totalQuestionsAnswered > 0
        ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
        : 0;

    const totalTimeSpent = domainStats.reduce(
      (sum: number, stat) => sum + (stat.metadata.totalTimeSpent || 0),
      0
    );

    const readContents = domainStats.filter(
      (stat) => (stat.metadata.timesRead || 0) > 0
    );

    const coveragePercentage =
      domainContents?.length > 0
        ? Math.round((readContents.length / domainContents?.length) * 100)
        : 0;

    const averageContentDepth =
      readContents.length > 0
        ? Math.round(
            readContents.reduce(
              (sum, stat) => sum + (stat.metadata.timesRead || 0),
              0
            ) / readContents.length
          )
        : 0;

    return {
      total: totalContents,
      completed: completedContents,
      percentage:
        totalContents > 0
          ? Math.round((completedContents / totalContents) * 100)
          : 0,
      questionsAnswered: totalQuestionsAnswered,
      performancePercentage,
      totalTimeSpent,
      coveragePercentage,
      averageContentDepth,
    };
  };

  const calculateChapterPerformance = (domain: Domain) => {
    if (!enrollmentStats || !courseContents) return [];

    const chapterIds = domain.chapters.map((chapter) => chapter.id);
    const chapterStats = enrollmentStats.enrollmentStats.filter((stat) => {
      const content = courseContents.find((c) => c.id === stat.contentId);
      return content?.chapterId && chapterIds.includes(content.chapterId);
    });

    interface ChapterPerformance {
      contentId: string;
      title: string;
      timesRead: number;
      totalTimeSpent: number;
      accuracy: number;
      lastReviewed: number;
    }

    return chapterStats.map((stat): ChapterPerformance => {
      const content = courseContents.find((c) => c.id === stat.contentId);
      const totalCorrect = stat.metadata.totalCorrect || 0;
      const totalIncorrect = stat.metadata.totalIncorrect || 0;
      const totalAttempts = totalCorrect + totalIncorrect;
      const accuracy =
        totalAttempts > 0
          ? Math.round((totalCorrect / totalAttempts) * 100)
          : 0;

      return {
        contentId: stat.contentId,
        title: content?.title || "Unknown Content",
        timesRead: stat.metadata.timesRead || 0,
        totalTimeSpent: stat.metadata.totalTimeSpent || 0,
        accuracy,
        lastReviewed: stat.metadata.lastReviewedAt,
      };
    });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Progress by Domain</h2>
      <div className="space-y-3">
        {domains?.map((domain) => {
          const progress = calculateDomainProgress(domain);
          const isExpanded = expandedDomain === domain.id;
          const chapterPerformance = isExpanded
            ? calculateChapterPerformance(domain)
            : [];

          return (
            <div
              key={domain.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">{domain.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {progress.coveragePercentage}%
                    </span>{" "}
                    coverage
                  </div>
                  {progress.averageContentDepth > 0 && (
                    <div className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {progress.averageContentDepth}x
                      </span>{" "}
                      depth
                    </div>
                  )}
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {progress.questionsAnswered}
                    </span>{" "}
                    questions
                  </div>
                  {progress.questionsAnswered > 0 && (
                    <div className="text-muted-foreground">
                      <span
                        className={`font-semibold ${
                          progress.performancePercentage === 0
                            ? "text-gray-400"
                            : progress.performancePercentage >= 70
                              ? "text-green-600"
                              : "text-orange-600"
                        }`}
                      >
                        {progress.performancePercentage}%
                      </span>{" "}
                      accuracy
                    </div>
                  )}
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {Math.round(progress.totalTimeSpent / 60)}m
                    </span>{" "}
                    spent
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <div className="space-y-3">
                    {chapterPerformance.map((perf) => (
                      <Link
                        key={perf.contentId}
                        href={`/courses/${courseId}/contents/${perf.contentId}`}
                        className="block"
                      >
                        <div className="pl-8 py-2 border-l-2 border-muted hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-medium">
                              {perf.title}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{perf.timesRead} reads</span>
                              <span>
                                {Math.round(perf.totalTimeSpent / 60)}m
                              </span>
                              <span
                                className={
                                  perf.accuracy === 0
                                    ? "text-gray-400"
                                    : perf.accuracy >= 70
                                      ? "text-green-600"
                                      : "text-orange-600"
                                }
                              >
                                {perf.accuracy}% accuracy
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {chapterPerformance.length === 0 && (
                      <p className="text-sm text-muted-foreground pl-8">
                        No performance data available yet
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {(!domains || domains.length === 0) && (
          <p className="text-sm text-muted-foreground">
            No domains available for this course
          </p>
        )}
      </div>
    </div>
  );
}
