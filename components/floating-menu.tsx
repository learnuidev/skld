"use client";

import { Button } from "@/components/ui/button";
import { isStructuredContent } from "@/lib/content-parser";
import { CourseContent } from "@/modules/course-content/course-content.types";
import { useListContentQuestions } from "@/modules/exam-bank-v2/use-list-content-questions";
import { KnowledgeGraph } from "@/modules/knowledge-graph/knowledge-graph.types";

import {
  BarChart3,
  GraduationCap,
  List,
  Network,
  Presentation,
} from "lucide-react";
import Link from "next/link";

interface FloatingMenuProps {
  courseId: string;
  contentId: string;
  contents: CourseContent[];
  content?: CourseContent;
  knowledgeGraph?: KnowledgeGraph;
  onStartQuiz?: () => void;
  onPresentation?: () => void;
  onOpenNavigator?: () => void;
  ongoingContentQuiz: boolean;
}

export function FloatingMenu({
  courseId,
  contentId,
  contents,
  content,
  knowledgeGraph,
  onStartQuiz,
  onPresentation,
  onOpenNavigator,
  ongoingContentQuiz,
}: FloatingMenuProps) {
  const { data: containQuestions, isLoading: isQuestionsLoading } =
    useListContentQuestions(contentId);

  return (
    <div className="flex items-center gap-2">
      <Button
        size="icon-lg"
        onClick={onOpenNavigator}
        className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
      >
        <List className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </Button>

      <Link href={`/courses/${courseId}/contents/${contentId}/history`}>
        <Button
          size="icon-lg"
          className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <BarChart3 className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Button>
      </Link>

      {knowledgeGraph?.status === "completed" &&
        knowledgeGraph.knowledgeGraphData && (
          <Link
            href={`/courses/${courseId}/contents/${contentId}/knowledge-graph`}
          >
            <Button
              size="icon-lg"
              className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <Network className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Button>
          </Link>
        )}

      {content && isStructuredContent(content?.content) && onPresentation && (
        <Button
          size="icon-lg"
          onClick={onPresentation}
          className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <Presentation className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Button>
      )}

      {containQuestions?.length > 0 && onStartQuiz && (
        <Button
          disabled={ongoingContentQuiz}
          size="icon-lg"
          onClick={onStartQuiz}
          className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
        >
          <GraduationCap className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Button>
      )}
    </div>
  );
}
