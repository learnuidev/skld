"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CourseContent } from "@/modules/course-content/course-content.types";
import { KnowledgeGraph } from "@/modules/knowledge-graph/knowledge-graph.types";
import { List, Network, Pencil, X, RefreshCw } from "lucide-react";
import Link from "next/link";

interface FloatingMenuProps {
  courseId: string;
  contentId: string;
  contents: CourseContent[];
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  knowledgeGraph?: KnowledgeGraph;
  onCreateKnowledgeGraph?: () => void;
  isCreatingKnowledgeGraph?: boolean;
  onRetryKnowledgeGraph?: () => void;
  isRetryingKnowledgeGraph?: boolean;
}

export function FloatingMenu({
  courseId,
  contentId,
  contents,
  isEditing,
  onEdit,
  onCancel,
  knowledgeGraph,
  onCreateKnowledgeGraph,
  isCreatingKnowledgeGraph,
  onRetryKnowledgeGraph,
  isRetryingKnowledgeGraph = false,
}: FloatingMenuProps) {
  return (
    <div className="flex flex-col gap-2 z-50">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="icon-lg"
              className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <List className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 p-0 shadow-2xl"
            side="top"
          >
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">
                Course Contents
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {contents.length} content{contents.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <div className="p-2 space-y-1">
                {contents.map((content) => (
                  <Link
                    key={content.id}
                    href={`/courses/${courseId}/contents/${content.id}`}
                    className={`block px-3 py-2.5 rounded-lg text-sm transition-all ${
                      content.id === contentId
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground text-foreground"
                    }`}
                  >
                    <div className="font-medium truncate">{content.title}</div>
                    {content.description && (
                      <div className="text-xs mt-0.5 opacity-80 truncate">
                        {content.description}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {knowledgeGraph?.status === "completed" &&
        knowledgeGraph.knowledgeGraphData ? (
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
        ) : knowledgeGraph?.status === "failed" ? (
          <Button
            size="icon-lg"
            onClick={onRetryKnowledgeGraph}
            disabled={isRetryingKnowledgeGraph}
            className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <RefreshCw
              className={`w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors ${
                isRetryingKnowledgeGraph ? "animate-spin" : ""
              }`}
            />
          </Button>
        ) : (
          <Button
            size="icon-lg"
            onClick={onCreateKnowledgeGraph}
            disabled={isCreatingKnowledgeGraph}
            className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
          >
            <Network
              className={`w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors ${
                isCreatingKnowledgeGraph ? "animate-pulse" : ""
              }`}
            />
          </Button>
        )}

        <Button
          size="icon-lg"
          onClick={isEditing ? onCancel : onEdit}
          className="rounded-full bg-background border-2 border-border hover:border-foreground/20 hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-200 group"
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
