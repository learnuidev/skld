"use client";

import { useState, useEffect } from "react";
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
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { ProgressByDomainChart } from "./components/progress-by-domain-chart";
import { CourseActivityGraph } from "./components/course-activity-graph";
import { UserContentStat } from "@/modules/skld/skld.types";
import { useRouter, useSearchParams } from "next/navigation";
import { getDashboardUrl } from "@/lib/utils";

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("monthly");

  const searchParams = useSearchParams();

  const localSelectedCourseId = searchParams.get("courseId") || "";

  const setLocalSelectedCourseId = (id: string) => {
    router.push(getDashboardUrl(id));
  };

  const router = useRouter();

  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const { data: enrollments, isLoading: enrollmentsLoading } =
    useGetEnrollmentsQuery({
      onSuccess: (enrollments) => {
        const lastEnrolled = Math.max(
          ...enrollments.map((enrollment) => {
            return enrollment.enrolledAt;
          })
        );

        const lastInteractedCourse = enrollments.find(
          (enrollment) => enrollment.enrolledAt === lastEnrolled
        );

        if (!localSelectedCourseId && lastInteractedCourse) {
          setLocalSelectedCourseId(lastInteractedCourse.courseId);
        }
      },
    });

  const { data: allCourses } = useListPublicCoursesQuery();

  const defaultEnrollmentId =
    enrollments && enrollments.length > 0
      ? [...enrollments].sort((a, b) => b.enrolledAt - a.enrolledAt)[0].id
      : "";

  console.log("local", localSelectedCourseId);

  const selectedEnrollment = enrollments?.find(
    (e) => e.courseId === localSelectedCourseId
  );
  const { data: selectedCourse } = useGetCourseQuery(
    localSelectedCourseId || ""
  );
  const { data: enrollmentStats } = useListUserEnrollmentStatsQuery(
    localSelectedCourseId || ""
  );
  const { data: courseContents } = useListCourseContentsQuery(
    localSelectedCourseId || ""
  );
  const { data: activityData } = useUserActivityGraph(
    localSelectedCourseId || "",
    selectedEnrollment?.id || "",
    viewMode
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
            value={localSelectedCourseId}
            onValueChange={(value) => {
              setLocalSelectedCourseId(value);
              setExpandedDomain(null);
            }}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select an enrollment" />
            </SelectTrigger>
            <SelectContent>
              {enrollments.map((enrollment) => {
                const course = allCourses?.find(
                  (c) => c.id === enrollment.courseId
                );
                return (
                  <SelectItem
                    key={enrollment.courseId}
                    value={enrollment.courseId}
                  >
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

            <CourseActivityGraph
              data={activityData}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
