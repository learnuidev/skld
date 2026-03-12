"use client";

import { CourseBackLink } from "@/components/course/course-back-link";
import { CourseContainer } from "@/components/course/course-container";
import { CourseHeader } from "@/components/course/course-header";
import { LoadingCourse } from "@/components/course/loading-course";
import { LoadingCourseFailed } from "@/components/course/loading-course-failed";
import { KnowledgeGraph } from "@/components/knowledge-graph/knowledge-graph";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetKnowledgeGraphQuery } from "@/modules/knowledge-graph/use-get-knowledge-graph-query";
import { useParams } from "next/navigation";

export default function KnowledgeGraphPage() {
  const params = useParams<{ courseId: string; chapterId: string }>();
  const sk = `CHAPTER#${params.chapterId}`;

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useGetCourseQuery(params.courseId);
  const { data: knowledgeGraph, isLoading: kgLoading } =
    useGetKnowledgeGraphQuery(sk);

  const chapter = course?.domains
    ?.flatMap((d) => d.chapters)
    .find((c) => c.id === params.chapterId);

  if (courseLoading || kgLoading) {
    return <LoadingCourse />;
  }

  if (courseError || !course) {
    return <LoadingCourseFailed />;
  }

  if (!chapter) {
    return (
      <CourseContainer>
        <CourseBackLink
          href={`/studio/${params.courseId}`}
          title="Back to Course"
        />
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">Chapter not found</p>
        </div>
      </CourseContainer>
    );
  }

  if (!knowledgeGraph || !knowledgeGraph.knowledgeGraphData) {
    return (
      <CourseContainer>
        <CourseBackLink
          href={`/studio/${params.courseId}/chapters/${params.chapterId}`}
          title="Back to Chapter"
        />
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">Knowledge graph not found</p>
        </div>
      </CourseContainer>
    );
  }

  return (
    <CourseContainer>
      <CourseBackLink
        href={`/studio/${params.courseId}/chapters/${params.chapterId}`}
        title="Back to Chapter"
      />

      <CourseHeader course={course} showDescription={false}>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Chapter</p>
          <p className="text-lg font-semibold text-foreground">
            {chapter.name}
          </p>
        </div>
      </CourseHeader>

      <div className="mt-12">
        <KnowledgeGraph
          graphData={knowledgeGraph.knowledgeGraphData}
          courseId={params.courseId ?? undefined}
        />
      </div>
    </CourseContainer>
  );
}
