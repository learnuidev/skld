import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip } from "@/components/ui/tooltip";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  HelpCircle,
  Layers,
  Target,
} from "lucide-react";
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

type SortOption = "reads" | "time" | "accuracy" | "order";

export function ProgressByDomainChart({
  courseId,
  domains,
  expandedDomain,
  setExpandedDomain,
  enrollmentStats,
  courseContents,
}: ProgressByDomainChartProps) {
  const [sortOption, setSortOption] = useState<SortOption>("reads");
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
      chapterIds.includes(content.chapterId || ""),
    );
    const totalContents = domainContents.length;
    const domainStats = enrollmentStats.enrollmentStats.filter((stat) =>
      domainContents.some((c) => c.id === stat.contentId),
    );
    const completedContents = domainStats.length;

    const totalQuestionsAnswered = domainStats.reduce(
      (sum: number, stat) =>
        sum +
        (stat.metadata.totalCorrect || 0) +
        (stat.metadata.totalIncorrect || 0),
      0,
    );

    const totalCorrect = domainStats.reduce(
      (sum: number, stat) => sum + (stat.metadata.totalCorrect || 0),
      0,
    );

    const performancePercentage =
      totalQuestionsAnswered > 0
        ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
        : 0;

    const totalTimeSpent = domainStats.reduce(
      (sum: number, stat) => sum + (stat.metadata.totalTimeSpent || 0),
      0,
    );

    const readContents = domainStats.filter(
      (stat) => (stat.metadata.timesRead || 0) > 0,
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
              0,
            ) / readContents.length,
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

  const calculateChapterProgress = (
    chapterId: string,
    domainContents: CourseContent[],
  ) => {
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

    const chapterContent = domainContents.filter(
      (c) => c.chapterId === chapterId,
    );
    const totalContents = chapterContent.length;
    const chapterStats = enrollmentStats.enrollmentStats.filter((stat) =>
      chapterContent.some((c) => c.id === stat.contentId),
    );
    const completedContents = chapterStats.length;

    const totalQuestionsAnswered = chapterStats.reduce(
      (sum: number, stat) =>
        sum +
        (stat.metadata.totalCorrect || 0) +
        (stat.metadata.totalIncorrect || 0),
      0,
    );

    const totalCorrect = chapterStats.reduce(
      (sum: number, stat) => sum + (stat.metadata.totalCorrect || 0),
      0,
    );

    const performancePercentage =
      totalQuestionsAnswered > 0
        ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
        : 0;

    const totalTimeSpent = chapterStats.reduce(
      (sum: number, stat) => sum + (stat.metadata.totalTimeSpent || 0),
      0,
    );

    const readContents = chapterStats.filter(
      (stat) => (stat.metadata.timesRead || 0) > 0,
    );

    const coveragePercentage =
      totalContents > 0
        ? Math.round((readContents.length / totalContents) * 100)
        : 0;

    const averageContentDepth =
      readContents.length > 0
        ? Math.round(
            readContents.reduce(
              (sum, stat) => sum + (stat.metadata.timesRead || 0),
              0,
            ) / readContents.length,
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

  const calculateContentPerformance = (
    chapterId: string,
    domainContents: CourseContent[],
  ) => {
    if (!courseContents) return [];

    const chapterContent = domainContents.filter(
      (c) => c.chapterId === chapterId,
    );

    interface ContentPerformance {
      contentId: string;
      title: string;
      coveragePercentage: number;
      contentDepth: number;
      questionsAnswered: number;
      accuracy: number;
      totalTimeSpent: number;
    }

    return chapterContent.map((content): ContentPerformance => {
      const stat = enrollmentStats?.enrollmentStats.find(
        (s) => s.contentId === content.id,
      );
      const timesRead = stat?.metadata.timesRead || 0;
      const totalCorrect = stat?.metadata.totalCorrect || 0;
      const totalIncorrect = stat?.metadata.totalIncorrect || 0;
      const totalAttempts = totalCorrect + totalIncorrect;
      const accuracy =
        totalAttempts > 0
          ? Math.round((totalCorrect / totalAttempts) * 100)
          : 0;
      const coveragePercentage = timesRead > 0 ? 100 : 0;

      return {
        contentId: content.id,
        title: content.title || "Unknown Content",
        coveragePercentage,
        contentDepth: timesRead,
        questionsAnswered: totalAttempts,
        accuracy,
        totalTimeSpent: stat?.metadata.totalTimeSpent || 0,
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
          const chapterIds = domain.chapters.map((chapter) => chapter.id);
          const domainContents = courseContents?.filter((content) =>
            chapterIds.includes(content.chapterId || ""),
          );

          return (
            <div
              key={domain.id}
              className="border border-border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <Tooltip
                  content={
                    <div>
                      <div className="font-semibold mb-1">{domain.name}</div>
                      <div className="text-xs">
                        Click to expand and view chapter-level progress
                      </div>
                    </div>
                  }
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">{domain.name}</span>
                  </div>
                </Tooltip>
                <div className="flex items-center gap-4 text-sm">
                  <Tooltip
                    content={
                      <div>
                        <div className="font-semibold mb-1">
                          Content Coverage
                        </div>
                        <div className="text-xs">
                          Percentage of unique content read at least once
                        </div>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span className="font-semibold text-foreground">
                        {progress.coveragePercentage}%
                      </span>
                    </div>
                  </Tooltip>
                  {progress.averageContentDepth > 0 && (
                    <Tooltip
                      content={
                        <div>
                          <div className="font-semibold mb-1">
                            Content Depth
                          </div>
                          <div className="text-xs">
                            Average times content has been read
                          </div>
                        </div>
                      }
                    >
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Layers className="w-4 h-4" />
                        <span className="font-semibold text-foreground">
                          {progress.averageContentDepth}x
                        </span>
                      </div>
                    </Tooltip>
                  )}
                  <Tooltip
                    content={
                      <div>
                        <div className="font-semibold mb-1">Questions</div>
                        <div className="text-xs">Total questions answered</div>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <HelpCircle className="w-4 h-4" />
                      <span className="font-semibold text-foreground">
                        {progress.questionsAnswered}
                      </span>
                    </div>
                  </Tooltip>
                  {progress.questionsAnswered > 0 && (
                    <Tooltip
                      content={
                        <div>
                          <div className="font-semibold mb-1">Accuracy</div>
                          <div className="text-xs">
                            Percentage of correctly answered questions
                          </div>
                        </div>
                      }
                    >
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Target
                          className={`w-4 h-4 ${
                            progress.performancePercentage === 0
                              ? "text-gray-400"
                              : progress.performancePercentage >= 70
                                ? "text-green-600"
                                : "text-orange-600"
                          }`}
                        />
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
                        </span>
                      </div>
                    </Tooltip>
                  )}
                  <Tooltip
                    content={
                      <div>
                        <div className="font-semibold mb-1">Time Spent</div>
                        <div className="text-xs">
                          Total time spent learning (minutes)
                        </div>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold text-foreground">
                        {Math.round(progress.totalTimeSpent / 60)}m
                      </span>
                    </div>
                  </Tooltip>
                </div>
              </button>

              {isExpanded && domainContents && (
                <div className="px-4 pb-4 pt-2 border-t border-border">
                  <div className="mb-4">
                    <Select
                      value={sortOption}
                      onValueChange={(value) =>
                        setSortOption(value as SortOption)
                      }
                    >
                      <SelectTrigger className="w-full max-w-xs">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reads">Sort by Reads</SelectItem>
                        <SelectItem value="time">Sort by Time Spent</SelectItem>
                        <SelectItem value="accuracy">
                          Sort by Accuracy
                        </SelectItem>
                        <SelectItem value="order">
                          Sort by Content Order
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    {domain.chapters.map((chapter) => {
                      const chapterProgress = calculateChapterProgress(
                        chapter.id,
                        domainContents,
                      );
                      let contentPerformance = calculateContentPerformance(
                        chapter.id,
                        domainContents,
                      );

                      contentPerformance = [...contentPerformance].sort(
                        (a, b) => {
                          switch (sortOption) {
                            case "reads":
                              return (
                                (b.contentDepth || 0) - (a.contentDepth || 0)
                              );
                            case "time":
                              return (
                                (b.totalTimeSpent || 0) -
                                (a.totalTimeSpent || 0)
                              );
                            case "accuracy":
                              return (b.accuracy || 0) - (a.accuracy || 0);
                            case "order":
                              const contentA = domainContents.find(
                                (c) => c.id === a.contentId,
                              );
                              const contentB = domainContents.find(
                                (c) => c.id === b.contentId,
                              );
                              return (
                                (contentA?.order || 0) - (contentB?.order || 0)
                              );
                            default:
                              return 0;
                          }
                        },
                      );

                      return (
                        <div
                          key={chapter.id}
                          className="border border-border rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-sm">
                              {chapter.name}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <Tooltip
                                content={
                                  <div>
                                    <div className="font-semibold mb-1">
                                      Coverage
                                    </div>
                                    <div className="text-xs">
                                      Percentage of unique content read at least
                                      once
                                    </div>
                                  </div>
                                }
                              >
                                <div className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  <span className="font-semibold text-foreground">
                                    {chapterProgress.coveragePercentage}%
                                  </span>
                                </div>
                              </Tooltip>
                              {chapterProgress.averageContentDepth > 0 && (
                                <Tooltip
                                  content={
                                    <div>
                                      <div className="font-semibold mb-1">
                                        Content Depth
                                      </div>
                                      <div className="text-xs">
                                        Average times content has been read
                                      </div>
                                    </div>
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    <Layers className="w-3 h-3" />
                                    <span className="font-semibold text-foreground">
                                      {chapterProgress.averageContentDepth}x
                                    </span>
                                  </div>
                                </Tooltip>
                              )}
                              <Tooltip
                                content={
                                  <div>
                                    <div className="font-semibold mb-1">
                                      Questions
                                    </div>
                                    <div className="text-xs">
                                      Total questions answered
                                    </div>
                                  </div>
                                }
                              >
                                <div className="flex items-center gap-1">
                                  <HelpCircle className="w-3 h-3" />
                                  <span className="font-semibold text-foreground">
                                    {chapterProgress.questionsAnswered}
                                  </span>
                                </div>
                              </Tooltip>
                              {chapterProgress.questionsAnswered > 0 && (
                                <Tooltip
                                  content={
                                    <div>
                                      <div className="font-semibold mb-1">
                                        Accuracy
                                      </div>
                                      <div className="text-xs">
                                        Percentage of correctly answered
                                        questions
                                      </div>
                                    </div>
                                  }
                                >
                                  <div className="flex items-center gap-1">
                                    <Target
                                      className={`w-3 h-3 ${
                                        chapterProgress.performancePercentage ===
                                        0
                                          ? "text-gray-400"
                                          : chapterProgress.performancePercentage >=
                                              70
                                            ? "text-green-600"
                                            : "text-orange-600"
                                      }`}
                                    />
                                    <span
                                      className={`font-semibold ${
                                        chapterProgress.performancePercentage ===
                                        0
                                          ? "text-gray-400"
                                          : chapterProgress.performancePercentage >=
                                              70
                                            ? "text-green-600"
                                            : "text-orange-600"
                                      }`}
                                    >
                                      {chapterProgress.performancePercentage}%
                                    </span>
                                  </div>
                                </Tooltip>
                              )}
                              <Tooltip
                                content={
                                  <div>
                                    <div className="font-semibold mb-1">
                                      Time Spent
                                    </div>
                                    <div className="text-xs">
                                      Total time spent learning (minutes)
                                    </div>
                                  </div>
                                }
                              >
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span className="font-semibold text-foreground">
                                    {Math.round(
                                      chapterProgress.totalTimeSpent / 60,
                                    )}
                                    m
                                  </span>
                                </div>
                              </Tooltip>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {contentPerformance.map((perf) => (
                              <Link
                                key={perf.contentId}
                                href={`/courses/${courseId}/contents/${perf.contentId}`}
                                className="block"
                              >
                                <div className="pl-4 py-2 border-l-2 border-muted hover:bg-muted/50 transition-colors cursor-pointer">
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm">
                                      {perf.title}
                                    </span>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <Tooltip
                                        content={
                                          <div>
                                            <div className="font-semibold mb-1">
                                              Coverage
                                            </div>
                                            <div className="text-xs">
                                              Percentage of unique content read
                                              at least once
                                            </div>
                                          </div>
                                        }
                                      >
                                        <div className="w-16 text-right">
                                          <span>
                                            {perf.coveragePercentage}%
                                          </span>
                                        </div>
                                      </Tooltip>
                                      {perf.contentDepth > 0 && (
                                        <Tooltip
                                          content={
                                            <div>
                                              <div className="font-semibold mb-1">
                                                Content Depth
                                              </div>
                                              <div className="text-xs">
                                                Times content has been read
                                              </div>
                                            </div>
                                          }
                                        >
                                          <div className="w-12 text-right">
                                            <span>{perf.contentDepth}x</span>
                                          </div>
                                        </Tooltip>
                                      )}
                                      <Tooltip
                                        content={
                                          <div>
                                            <div className="font-semibold mb-1">
                                              Questions
                                            </div>
                                            <div className="text-xs">
                                              Total questions answered
                                            </div>
                                          </div>
                                        }
                                      >
                                        <div className="w-12 text-right">
                                          <span>{perf.questionsAnswered}</span>
                                        </div>
                                      </Tooltip>
                                      <Tooltip
                                        content={
                                          <div>
                                            <div className="font-semibold mb-1">
                                              Accuracy
                                            </div>
                                            <div className="text-xs">
                                              Percentage of correctly answered
                                              questions
                                            </div>
                                          </div>
                                        }
                                      >
                                        <div
                                          className={`w-12 text-right ${
                                            perf.accuracy === 0
                                              ? "text-gray-400"
                                              : perf.accuracy >= 70
                                                ? "text-green-600"
                                                : "text-orange-600"
                                          }`}
                                        >
                                          <span>{perf.accuracy}%</span>
                                        </div>
                                      </Tooltip>
                                      <Tooltip
                                        content={
                                          <div>
                                            <div className="font-semibold mb-1">
                                              Time Spent
                                            </div>
                                            <div className="text-xs">
                                              Time spent on this content
                                              (minutes)
                                            </div>
                                          </div>
                                        }
                                      >
                                        <div className="w-12 text-right">
                                          <span>
                                            {Math.round(
                                              perf.totalTimeSpent / 60,
                                            )}
                                          </span>
                                        </div>
                                      </Tooltip>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            ))}
                            {contentPerformance.length === 0 && (
                              <p className="text-sm text-muted-foreground pl-4">
                                No content available in this chapter
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {domain.chapters.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No chapters available in this domain
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
