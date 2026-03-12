"use client";

import { Button } from "@/components/ui/button";
import { CourseContent } from "@/modules/course-content/course-content.types";
import {
  CheckCircle2,
  Clock,
  FileText,
  XCircle,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { KnowledgeGraph } from "@/modules/knowledge-graph/knowledge-graph.types";
import { useIsUserCourseAuthor } from "@/modules/course/use-is-user-course-author";

interface ChapterContentsListProps {
  contents: CourseContent[];
  courseId: string;
  chapterId: string;
  knowledgeGraph: KnowledgeGraph | null | undefined;
  onCreateKnowledgeGraph: () => void;
  isCreatingKnowledgeGraph: boolean;
}

export function ChapterContentsList({
  contents,
  courseId,
  chapterId,
  knowledgeGraph,
  onCreateKnowledgeGraph,
  isCreatingKnowledgeGraph,
}: ChapterContentsListProps) {
  const isAuthor = useIsUserCourseAuthor(courseId);

  const getStatusInfo = () => {
    if (!knowledgeGraph) {
      return {
        icon: <Clock className="size-4" />,
        text: "Not generated",
        color: "text-muted-foreground",
      };
    }

    switch (knowledgeGraph.status) {
      case "pending":
      case "processing":
        return {
          icon: <Clock className="size-4 animate-spin" />,
          text: "Pending",
          color: "text-yellow-600",
        };
      case "in_progress":
        return {
          icon: <Clock className="size-4 animate-spin" />,
          text: "Processing",
          color: "text-blue-600",
        };
      case "completed":
        return {
          icon: <CheckCircle2 className="size-4" />,
          text: "Completed",
          color: "text-green-600",
        };
      case "failed":
        return {
          icon: <XCircle className="size-4" />,
          text: "Failed",
          color: "text-red-600",
        };
      default:
        return {
          icon: <Clock className="size-4" />,
          text: "Unknown",
          color: "text-muted-foreground",
        };
    }
  };

  const statusInfo = getStatusInfo();

  const isProcessing = ["pending", "processing"].includes(
    knowledgeGraph?.status || ""
  );

  const isCompleted = knowledgeGraph?.status === "completed";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Chapter Contents
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {contents.length} content{contents.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAuthor ? (
          isCompleted ? (
            <Link
              href={`/studio/${courseId}/chapters/${chapterId}/knowledge-graph`}
            >
              <Button className="rounded-full gap-2">
                <Eye className="size-4" />
                View Knowledge Graph
              </Button>
            </Link>
          ) : (
            <Button
              onClick={onCreateKnowledgeGraph}
              disabled={isCreatingKnowledgeGraph || isProcessing}
              className="rounded-full gap-2"
            >
              {isCreatingKnowledgeGraph ? (
                <>
                  <Clock className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  {isProcessing
                    ? "Creation in Progress"
                    : "Add Knowledge Graph"}
                </>
              )}
            </Button>
          )
        ) : null}
      </div>

      {knowledgeGraph && (
        <div className="p-4 bg-muted border border-border rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={statusInfo.color}>{statusInfo.icon}</div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Knowledge Graph Status
                </p>
                <p className={`text-xs ${statusInfo.color}`}>
                  {statusInfo.text}
                </p>
              </div>
            </div>
            {knowledgeGraph.error && (
              <p className="text-xs text-red-600 max-w-md truncate">
                {knowledgeGraph.error}
              </p>
            )}
          </div>
          {knowledgeGraph.knowledgeGraphData && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Generated: {new Date(knowledgeGraph.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}

      {!contents || contents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No content yet
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-8">
            This chapter doesn't have any content yet.
          </p>
          <Link href={`/studio/${courseId}`}>
            <Button className="rounded-full gap-2">
              <Plus className="size-4" />
              Add content
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              courseId={courseId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ContentCard({
  content,
  courseId,
}: {
  content: CourseContent;
  courseId: string;
}) {
  return (
    <div className="p-6 bg-card border border-border rounded-2xl hover:border-border/80 transition-all">
      <Link
        href={`/courses/${courseId}/contents/${content.id}`}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex-1 space-y-2">
          <h3 className="text-base font-semibold text-foreground hover:text-primary/80 transition-colors">
            {content.title}
          </h3>
          {content.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {content.description}
            </p>
          )}
          <div className="flex items-center gap-2 pt-1">
            {content.contentVaraints?.map((variant) => (
              <span
                key={variant}
                className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground capitalize"
              >
                {variant}
              </span>
            ))}
            <span className="text-xs text-muted-foreground">
              Order: {content.order}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
