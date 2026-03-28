"use client";

import { useState } from "react";
import { useGetEnrollmentsQuery } from "@/modules/enrollment/use-get-enrollment-query";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useListPublicCoursesQuery } from "@/modules/course/use-list-public-courses-query";
import { useListUserEnrollmentStatsQuery } from "@/modules/enrollment/use-list-user-enrollment-stats-query";
import { useListCourseContentsQuery } from "@/modules/course-content/use-list-course-contents-query";
import { useUserActivityGraph } from "@/hooks/use-user-activity-graph";
import { PageContainer } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, TrendingUp } from "lucide-react";
import Link from "next/link";
import { ProgressByDomainChart } from "./components/progress-by-domain-chart";

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const { data: enrollments, isLoading: enrollmentsLoading } =
    useGetEnrollmentsQuery();
  const { data: allCourses } = useListPublicCoursesQuery();

  const defaultEnrollmentId =
    enrollments && enrollments.length > 0 ? enrollments[0].id : "";
  const [localSelectedEnrollmentId, setLocalSelectedEnrollmentId] =
    useState<string>(() => defaultEnrollmentId);

  const selectedEnrollment = enrollments?.find(
    (e) => e.id === localSelectedEnrollmentId,
  );
  const { data: selectedCourse } = useGetCourseQuery(
    selectedEnrollment?.courseId || "",
  );
  const { data: enrollmentStats } = useListUserEnrollmentStatsQuery(
    selectedEnrollment?.courseId || "",
  );
  const { data: courseContents } = useListCourseContentsQuery(
    selectedEnrollment?.courseId || "",
  );
  const { data: activityData } = useUserActivityGraph(
    selectedEnrollment?.courseId || "",
    localSelectedEnrollmentId || "",
    viewMode,
  );

  if (enrollmentsLoading) {
    return (
      <PageContainer>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </PageContainer>
    );
  }

  const hasEnrollments = enrollments && enrollments.length > 0;

  if (!hasEnrollments) {
    return (
      <PageContainer>
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-semibold mb-2">
            You are not enrolled in any course
          </h1>
          <p className="text-muted-foreground mb-6">
            Start your learning journey by enrolling in a course
          </p>
          <Link href="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Hi, here's your learning summary so far:"
        description="Track your progress and performance across your enrolled courses"
      />

      <div className="space-y-8">
        {/* Enrollment Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select Enrollment
          </label>
          <Select
            value={localSelectedEnrollmentId}
            onValueChange={(value) => {
              setLocalSelectedEnrollmentId(value);
              setExpandedDomain(null);
            }}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select an enrollment" />
            </SelectTrigger>
            <SelectContent>
              {enrollments.map((enrollment) => {
                const course = allCourses?.find(
                  (c) => c.id === enrollment.courseId,
                );
                return (
                  <SelectItem key={enrollment.id} value={enrollment.id}>
                    {course?.title || "Loading..."}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedEnrollment && selectedCourse && (
          <>
            <ProgressByDomainChart
              domains={selectedCourse.domains}
              expandedDomain={expandedDomain}
              setExpandedDomain={setExpandedDomain}
              enrollmentStats={enrollmentStats}
              courseContents={courseContents}
            />

            {/* Activity Graph */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Activity Graph
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "monthly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={viewMode === "yearly" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("yearly")}
                  >
                    Yearly
                  </Button>
                </div>
              </div>

              <ActivityGraph data={activityData} />
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}

interface ActivityGraphProps {
  data: number[] | undefined;
}

function ActivityGraph({ data }: ActivityGraphProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
          No activity data available
        </div>
      </div>
    );
  }

  const maxActivity = Math.max(...data, 1);

  const getColor = (value: number) => {
    const intensity = value / maxActivity;
    if (intensity === 0) return "bg-muted";
    if (intensity < 0.25) return "bg-green-100 dark:bg-green-900/30";
    if (intensity < 0.5) return "bg-green-200 dark:bg-green-800/40";
    if (intensity < 0.75) return "bg-green-300 dark:bg-green-700/50";
    return "bg-green-400 dark:bg-green-600/60";
  };

  const weeks = Math.ceil(data.length / 7);

  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <div className="flex gap-1">
        {Array.from({ length: weeks }, (_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const dataIndex = weekIndex * 7 + dayIndex;
              const value = data[dataIndex] || 0;

              return (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm ${getColor(value)} transition-colors`}
                  title={`${value} activities`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <div className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/30" />
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-800/40" />
          <div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700/50" />
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600/60" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
