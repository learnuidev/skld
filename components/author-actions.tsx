"use client";

import { Button } from "@/components/ui/button";
import { KnowledgeGraph } from "@/modules/knowledge-graph/knowledge-graph.types";

import { Clock, Network, Pencil, Sparkles, X } from "lucide-react";
import Link from "next/link";

interface AuthorActionsProps {
  courseId: string;
  contentId: string;
  knowledgeGraph?: KnowledgeGraph;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onCreateKnowledgeGraph?: () => Promise<void>;
  isCreatingKnowledgeGraph?: boolean;
  onRetryKnowledgeGraph?: () => Promise<void>;
  isRetryingKnowledgeGraph?: boolean;
}

export function AuthorActions({
  courseId,
  contentId,
  knowledgeGraph,
  isEditing,
  onEdit,
  onCancel,
  onCreateKnowledgeGraph,
  isCreatingKnowledgeGraph,
  onRetryKnowledgeGraph,
  isRetryingKnowledgeGraph = false,
}: AuthorActionsProps) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50">
      <div className="flex flex-col gap-2">
        {knowledgeGraph?.status !== "completed" && (
          <Button
            size="icon-lg"
            onClick={
              knowledgeGraph?.status === "failed"
                ? onRetryKnowledgeGraph
                : onCreateKnowledgeGraph
            }
            disabled={isCreatingKnowledgeGraph || isRetryingKnowledgeGraph}
            className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
            title={
              knowledgeGraph?.status === "failed"
                ? "Retry Knowledge Graph"
                : "Create Knowledge Graph"
            }
          >
            {["in_progress", "processing"].includes(
              knowledgeGraph?.status || ""
            ) ? (
              <Clock className="size-4 animate-spin text-yellow-600" />
            ) : knowledgeGraph?.status === "failed" ? (
              <Network
                className={`w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors ${
                  isRetryingKnowledgeGraph ? "animate-spin" : ""
                }`}
              />
            ) : (
              <Network
                className={`w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors ${
                  isCreatingKnowledgeGraph ? "animate-spin" : ""
                }`}
              />
            )}
          </Button>
        )}

        <Link href={`/courses/${courseId}/contents/${contentId}/new-exam-bank`}>
          <Button
            size="icon-lg"
            className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
            title="Create Exam Bank"
          >
            <Sparkles className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        </Link>

        <Button
          size="icon-lg"
          onClick={isEditing ? onCancel : onEdit}
          className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
          title={isEditing ? "Cancel Edit" : "Edit Content"}
        >
          {isEditing ? (
            <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <Pencil className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </Button>
      </div>
    </div>
  );
}
