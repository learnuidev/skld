"use client";

import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useListUserContentHistoriesQuery } from "@/modules/user-content-histories/use-list-user-content-histories-query";
import { UserContentHistory } from "@/modules/user-content-histories/user-content-histories.types";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  Check,
  Clock,
  ArrowUpDown,
  Filter,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts";

type FilterType = "all" | "content" | "quiz";
type SortType = "date-desc" | "date-asc" | "time-desc" | "time-asc";
type TimeFilterType = "24h" | "weekly" | "monthly";

export default function ContentHistoryPage() {
  const params = useParams<{ courseId: string; contentId: string }>();
  const { data: course } = useGetCourseQuery(params.courseId);
  const { data: historiesData, isLoading } = useListUserContentHistoriesQuery(
    params.courseId,
    params.contentId
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("date-desc");
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("24h");

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isQuiz = (history: UserContentHistory) => {
    return !!history.quizData;
  };

  const stats = useMemo(() => {
    if (
      !historiesData?.userContentHistories ||
      historiesData.userContentHistories.length === 0
    ) {
      return {
        totalTimeSpent: 0,
        totalViews: 0,
        daysSpent: 0,
        accuracy: 0,
      };
    }

    const histories = historiesData.userContentHistories;
    const contentHistories = histories.filter((h) => !isQuiz(h));
    const quizHistories = histories.filter((h) => isQuiz(h));

    const totalTimeSpent = histories.reduce((sum, h) => {
      return (
        sum + (isQuiz(h) ? h.quizData?.timeSpent || 0 : h.totalTimeSpent || 0)
      );
    }, 0);

    const totalViews = contentHistories.length;
    const daysSpent = Math.ceil(totalTimeSpent / (60 * 60 * 24));

    let totalCorrect = 0;
    let totalIncorrect = 0;
    quizHistories.forEach((h) => {
      if (h.quizData?.isCorrect) {
        totalCorrect++;
      } else {
        totalIncorrect++;
      }
    });

    const totalQuestions = totalCorrect + totalIncorrect;
    const accuracy =
      totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    return {
      totalTimeSpent,
      totalViews,
      daysSpent,
      accuracy,
    };
  }, [historiesData]);

  const filteredAndSortedHistories = useMemo(() => {
    if (!historiesData?.userContentHistories) return [];

    let filtered = [...historiesData.userContentHistories];

    if (filter === "content") {
      filtered = filtered.filter((h) => !isQuiz(h));
    } else if (filter === "quiz") {
      filtered = filtered.filter((h) => isQuiz(h));
    }

    filtered.sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return b.createdAt - a.createdAt;
        case "date-asc":
          return a.createdAt - b.createdAt;
        case "time-desc":
          const timeA = isQuiz(a)
            ? a.quizData?.timeSpent || 0
            : a.totalTimeSpent || 0;
          const timeB = isQuiz(b)
            ? b.quizData?.timeSpent || 0
            : b.totalTimeSpent || 0;
          return timeB - timeA;
        case "time-asc":
          const timeA2 = isQuiz(a)
            ? a.quizData?.timeSpent || 0
            : a.totalTimeSpent || 0;
          const timeB2 = isQuiz(b)
            ? b.quizData?.timeSpent || 0
            : b.totalTimeSpent || 0;
          return timeA2 - timeB2;
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return filtered;
  }, [historiesData, filter, sort]);

  const chartData = useMemo(() => {
    if (
      !historiesData?.userContentHistories ||
      historiesData.userContentHistories.length === 0
    ) {
      return [];
    }

    const histories = historiesData.userContentHistories;
    const now = Date.now();

    const timeRanges = {
      "24h": 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000,
    };

    const range = timeRanges[timeFilter];
    const currentStart = now - range;

    const processData = (startTime: number, endTime: number) => {
      const buckets: {
        [key: string]: {
          count: number;
          correct: number;
          totalQuestions: number;
        };
      } = {};

      if (timeFilter === "weekly") {
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        dayNames.forEach((day) => {
          buckets[day] = { count: 0, correct: 0, totalQuestions: 0 };
        });
      } else {
        const bucketSize =
          timeFilter === "24h" ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

        for (let time = startTime; time < endTime; time += bucketSize) {
          const date = new Date(time);
          let key: string;
          if (timeFilter === "24h") {
            key = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              hour12: false,
            });
          } else {
            key = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }
          buckets[key] = { count: 0, correct: 0, totalQuestions: 0 };
        }
      }

      const filteredHistories = histories.filter(
        (h) => h.createdAt >= startTime && h.createdAt < endTime
      );
      filteredHistories.forEach((history) => {
        const date = new Date(history.createdAt);
        let key: string;
        if (timeFilter === "24h") {
          key = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            hour12: false,
          });
        } else if (timeFilter === "weekly") {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayIndex = date.getDay();
          const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          key = dayNames[adjustedDayIndex + 1];
        } else {
          key = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }
        if (buckets[key] !== undefined) {
          buckets[key].count++;
          if (history.quizData) {
            buckets[key].correct += history.quizData.totalCorrect || 0;
            buckets[key].totalQuestions +=
              (history.quizData.totalCorrect || 0) +
              (history.quizData.totalIncorrect || 0);
          }
        }
      });

      if (timeFilter === "weekly") {
        const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return dayNames.map((label) => ({
          label,
          value: buckets[label].count,
          performance: parseInt(
            (buckets[label].totalQuestions > 0
              ? (buckets[label].correct / buckets[label].totalQuestions) * 100
              : 0
            ).toFixed(0)
          ),
        }));
      }

      return Object.entries(buckets).map(([label, data]) => ({
        label,
        value: data.count,
        performance:
          data.totalQuestions > 0
            ? (data.correct / data.totalQuestions) * 100
            : 0,
      }));
    };

    return processData(currentStart, now);
  }, [historiesData, timeFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-foreground/10 border-t-foreground rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-destructive">Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link
          href={`/courses/${params.courseId}/contents/${params.contentId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-2 mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Content
        </Link>

        {stats.totalTimeSpent > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="grid grid-cols-4 gap-8">
              <div className="border-b border-border pb-6">
                <div className="text-4xl font-light text-foreground mb-2">
                  {formatDuration(stats.totalTimeSpent)}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Time
                </div>
              </div>

              <div className="border-b border-border pb-6">
                <div className="text-4xl font-light text-foreground mb-2">
                  {stats.totalViews}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Views
                </div>
              </div>

              <div className="border-b border-border pb-6">
                <div className="text-4xl font-light text-foreground mb-2">
                  {stats.daysSpent}d
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Days Spent
                </div>
              </div>

              <div className="border-b border-border pb-6">
                <div className="text-4xl font-light text-foreground mb-2">
                  {Math.round(stats.accuracy)}%
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  Performance
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="bg-muted mb-8">
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Content Activity
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Content Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Activity Overview
                  </span>
                </div>

                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  {(["24h", "weekly", "monthly"] as TimeFilterType[]).map(
                    (filterType) => (
                      <button
                        key={filterType}
                        onClick={() => setTimeFilter(filterType)}
                        className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                          timeFilter === filterType
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {filterType === "24h"
                          ? "24 Hours"
                          : filterType === "weekly"
                            ? "Weekly"
                            : "Monthly"}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="border border-border rounded-xl p-6 bg-background/50 backdrop-blur-sm">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      opacity={0.1}
                    />
                    <XAxis
                      dataKey="label"
                      stroke="currentColor"
                      opacity={0.5}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="currentColor"
                      opacity={0.5}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="currentColor"
                      opacity={0.5}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="circle"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="value"
                      stroke="#6A7A8E"
                      strokeWidth={3}
                      activeDot={{ r: 6 }}
                      name="Activity"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="performance"
                      stroke="#C97C5D"
                      strokeWidth={2}
                      activeDot={{ r: 5 }}
                      name="Performance %"
                    />
                  </LineChart>
                </ResponsiveContainer>

                <div className="flex items-center justify-center gap-8 mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-0.5 rounded"
                      style={{ backgroundColor: "#6A7A8E" }}
                    />
                    <span className="text-sm text-muted-foreground">
                      Activity
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-0.5 rounded"
                      style={{ backgroundColor: "#C97C5D" }}
                    />
                    <span className="text-sm text-muted-foreground">
                      Performance %
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {(["all", "content", "quiz"] as FilterType[]).map(
                      (filterType) => (
                        <button
                          key={filterType}
                          onClick={() => setFilter(filterType)}
                          className={`px-4 py-1.5 text-sm rounded-md transition-all ${
                            filter === filterType
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {filterType === "all"
                            ? "All"
                            : filterType === "content"
                              ? "Content"
                              : "Quiz"}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowUpDown className="w-4 h-4" />
                      <span>
                        {sort === "date-desc"
                          ? "Newest First"
                          : sort === "date-asc"
                            ? "Oldest First"
                            : sort === "time-desc"
                              ? "Most Time"
                              : "Least Time"}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSort("date-desc")}>
                      Newest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("date-asc")}>
                      Oldest First
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("time-desc")}>
                      Most Time Spent
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSort("time-asc")}>
                      Least Time Spent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {filteredAndSortedHistories.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-center py-32"
                >
                  <Clock className="w-16 h-16 text-muted-foreground/20 mx-auto mb-6" />
                  <p className="text-muted-foreground">
                    {filter === "all"
                      ? "No activity yet"
                      : `No ${filter} activity found`}
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedHistories.map((history, index) => (
                    <motion.div
                      key={history.sk}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="group border-b border-border/50 pb-6 last:border-0"
                    >
                      <div className="flex items-start gap-8">
                        <div className="flex-shrink-0 w-24 pt-1">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                            {formatDate(history.createdAt).split(",")[0]}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(history.createdAt)
                              .split(",")[1]
                              ?.trim()}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {isQuiz(history) ? (
                                <CheckCircle className="w-4 h-4 text-foreground/60" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-foreground/60" />
                              )}
                              <span className="text-sm text-foreground">
                                {isQuiz(history)
                                  ? "Quiz Attempt"
                                  : "Content View"}
                              </span>
                            </div>

                            {isQuiz(history) && history.quizData && (
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  history.quizData.isCorrect
                                    ? "bg-green-500/10 text-green-600"
                                    : "bg-red-500/10 text-red-500"
                                }`}
                              >
                                {history.quizData.isCorrect
                                  ? "Correct"
                                  : "Incorrect"}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-8 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {formatDuration(
                                  isQuiz(history)
                                    ? history.quizData?.timeSpent || 0
                                    : history.totalTimeSpent || 0
                                )}
                              </span>
                            </div>

                            {isQuiz(history) && history.quizData && (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground/60">
                                    Accuracy:
                                  </span>
                                  <span className="text-foreground">
                                    {Math.round(
                                      history.quizData.overallAccuracy
                                    )}
                                    %
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Check className="w-3.5 h-3.5 text-green-500/60" />
                                  <span>{history.quizData.totalCorrect}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-3.5 h-3.5 text-red-500/60" />
                                  <span>{history.quizData.totalIncorrect}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredAndSortedHistories.length > 0 && (
                <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
                  Showing {filteredAndSortedHistories.length}{" "}
                  {filteredAndSortedHistories.length === 1
                    ? "entry"
                    : "entries"}
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
