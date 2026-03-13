"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { KnowledgeGraph } from "@/components/knowledge-graph/knowledge-graph";
import { useGetCourseContentQuery } from "@/modules/course-content/use-get-course-content-query";
import { useGetCourseQuery } from "@/modules/course/use-get-course-query";
import { useGetKnowledgeGraphQuery } from "@/modules/knowledge-graph/use-get-knowledge-graph-query";

export default function ContentKnowledgeGraphPage() {
  const params = useParams<{ courseId: string; contentId: string }>();
  const sk = `CONTENT_${params.contentId}`;

  const { data: course, isLoading: courseLoading } = useGetCourseQuery(
    params.courseId
  );
  const { data: content, isLoading: contentLoading } = useGetCourseContentQuery(
    params.courseId,
    params.contentId
  );
  const { data: knowledgeGraph, isLoading: kgLoading } =
    useGetKnowledgeGraphQuery(sk);

  const isLoading = courseLoading || contentLoading || kgLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!course || !content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">Content not found</div>
      </div>
    );
  }

  if (!knowledgeGraph || !knowledgeGraph.knowledgeGraphData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-0 py-16 lg:py-24">
          <Link
            href={`/courses/${params.courseId}/contents/${params.contentId}`}
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Content
          </Link>
          <div className="flex items-center justify-center py-24">
            <p className="text-muted-foreground">Knowledge graph not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-16 lg:py-24">
        <Link
          href={`/courses/${params.courseId}/contents/${params.contentId}`}
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Content
        </Link>

        <div className="space-y-8">
          <header>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {course.title}
            </p>
            <h1 className="text-3xl lg:text-5xl font-semibold tracking-tight text-foreground text-balance leading-[1.15]">
              {content.title}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Knowledge Graph
            </p>
          </header>

          <div>
            <KnowledgeGraph
              graphData={knowledgeGraph.knowledgeGraphData}
              courseId={params.courseId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
