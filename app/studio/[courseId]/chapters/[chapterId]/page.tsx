"use client";

import { CourseBackLink } from "@/components/course/course-back-link";
import { CourseContainer } from "@/components/course/course-container";
import { CourseHeader } from "@/components/course/course-header";
import { LoadingCourse } from "@/components/course/loading-course";
import { LoadingCourseFailed } from "@/components/course/loading-course-failed";
import { useCreateKnowledgeGraphMutation } from "@/modules/knowledge-graph/use-create-knowledge-graph-mutation";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useListCourseContentsQuery } from "@/modules/course-content/use-list-course-contents-query";
import { useGetKnowledgeGraphQuery } from "@/modules/knowledge-graph/use-get-knowledge-graph-query";
import { useParams, useRouter } from "next/navigation";
import { ChapterContentsList } from "./components/chapter-contents-list";

export default function ChapterDetailPage() {
  const params = useParams<{ courseId: string; chapterId: string }>();
  const router = useRouter();

  const sk = `CHAPTER#${params.chapterId}`;

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useGetCourseQuery(params.courseId);
  const { data: contents, isLoading: contentsLoading } =
    useListCourseContentsQuery(params.courseId);
  const { data: knowledgeGraph, isLoading: kgLoading } =
    useGetKnowledgeGraphQuery(sk);
  const createKnowledgeGraphMutation = useCreateKnowledgeGraphMutation();

  const chapter = course?.domains
    ?.flatMap((d) => d.chapters)
    .find((c) => c.id === params.chapterId);

  const chapterContents =
    contents?.filter((content) => content.chapterId === params.chapterId) || [];

  const handleCreateKnowledgeGraph = async () => {
    try {
      await createKnowledgeGraphMutation.mutateAsync({
        courseId: params.courseId,
        chapterId: params.chapterId,
      });
    } catch (error) {
      console.error("Failed to create knowledge graph:", error);
    }
  };

  if (courseLoading || contentsLoading || kgLoading) {
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

  return (
    <CourseContainer>
      <CourseBackLink
        href={`/studio/${params.courseId}`}
        title="Back to Course"
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
        <ChapterContentsList
          contents={chapterContents}
          courseId={params.courseId}
          chapterId={params.chapterId}
          knowledgeGraph={knowledgeGraph ?? null}
          onCreateKnowledgeGraph={handleCreateKnowledgeGraph}
          isCreatingKnowledgeGraph={createKnowledgeGraphMutation.isPending}
        />
      </div>
    </CourseContainer>
  );
}
