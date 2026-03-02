"use client";

import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();

  const { data: course, isLoading, error } = useGetCourseQuery(params.courseId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-slate-600 dark:text-slate-400">
              Loading course...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-red-600 dark:text-red-400">
              Failed to load course
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link
            href="/studio"
            className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-6"
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
            Back to Studio
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 overflow-hidden">
          <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-3">
                  {course.title}
                </h1>
                {course.description && (
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                    {course.description}
                  </p>
                )}
              </div>
              <Link href={`/studio/${course.id}/edit`}>
                <Button className="rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl transition-shadow">
                  Edit Course
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-10">
            <Tabs defaultValue="general" className="w-full">
              <TabsList
                variant="line"
                className="w-full justify-start border-b border-slate-200 dark:border-slate-800 rounded-none h-14 bg-transparent"
              >
                <TabsTrigger
                  value="general"
                  className="h-12 px-6 text-base font-medium data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                >
                  General Info
                </TabsTrigger>
                <TabsTrigger
                  value="materials"
                  className="h-12 px-6 text-base font-medium data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                >
                  Learning Materials
                </TabsTrigger>
                <TabsTrigger
                  value="exams"
                  className="h-12 px-6 text-base font-medium data-[state=active]:text-slate-900 dark:data-[state=active]:text-white"
                >
                  Exam Bank
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-8">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                        <svg
                          className="w-5 h-5 mr-3 text-slate-400"
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
                        Course Details
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Course Type
                          </label>
                          <p className="text-base font-medium text-slate-900 dark:text-white capitalize group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                            {course.courseType || "Not specified"}
                          </p>
                        </div>
                        <div className="group">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Certification
                          </label>
                          <p className="text-base font-medium text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                            {course.hasCertification ? (
                              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Available
                              </span>
                            ) : (
                              "Not Available"
                            )}
                          </p>
                        </div>
                        <div className="group">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Created
                          </label>
                          <p className="text-base font-medium text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                            {new Date(course.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                        <div className="group">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                            Last Updated
                          </label>
                          <p className="text-base font-medium text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                            {new Date(course.updatedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {course.domains && course.domains.length > 0 && (
                      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-8">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                          <svg
                            className="w-5 h-5 mr-3 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                          Domains
                          <span className="ml-3 px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                            {course.domains.length}
                          </span>
                        </h3>
                        <div className="space-y-4">
                          {course.domains.map((domain) => (
                            <div
                              key={domain.id}
                              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                            >
                              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                                {domain.name}
                              </h4>
                              {domain.chapters &&
                                domain.chapters.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {domain.chapters.map((chapter) => (
                                      <span
                                        key={chapter.id}
                                        className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm"
                                      >
                                        <svg
                                          className="w-3 h-3 mr-2 text-slate-400"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                        {chapter.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8">
                    {course.exam && (
                      <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-8">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                          <svg
                            className="w-5 h-5 mr-3 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            />
                          </svg>
                          Exam Config
                        </h3>
                        <div className="space-y-5">
                          <div className="group">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                              Total Questions
                            </label>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                              {course.exam.totalQuestions}
                            </p>
                          </div>
                          {course.exam.totalTimeMinutes && (
                            <div className="group">
                              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                Time Limit
                              </label>
                              <p className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                {course.exam.totalTimeMinutes}m
                              </p>
                            </div>
                          )}
                          <div className="group">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                              Skip Questions
                            </label>
                            <p className="text-base font-medium text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                              {course.exam.allowSkipQuestions ? (
                                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs">
                                  Enabled
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs">
                                  Disabled
                                </span>
                              )}
                            </p>
                          </div>
                          {course.exam.domainWeights &&
                            Object.keys(course.exam.domainWeights).length >
                              0 && (
                              <div>
                                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                                  Domain Weights
                                </label>
                                <div className="space-y-3">
                                  {Object.entries(
                                    course.exam.domainWeights,
                                  ).map(([domainId, weight]) => {
                                    const domain = course.domains?.find(
                                      (d) => d.id === domainId,
                                    );
                                    return (
                                      <div key={domainId}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                                            {domain?.name || domainId}
                                          </span>
                                          <span className="text-slate-900 dark:text-white font-semibold">
                                            {weight}%
                                          </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                          <div
                                            className="h-full bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-500 dark:to-slate-400 rounded-full transition-all duration-300"
                                            style={{ width: `${weight}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="materials" className="mt-10">
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <svg
                        className="w-10 h-10 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                      Learning Materials
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6 text-lg">
                      Add and manage learning materials for your course here.
                    </p>
                    <div className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium">
                      Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="exams" className="mt-10">
                <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <svg
                        className="w-10 h-10 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                      Exam Bank
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6 text-lg">
                      Create and manage exam questions for your course here.
                    </p>
                    <div className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium">
                      Coming soon
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
