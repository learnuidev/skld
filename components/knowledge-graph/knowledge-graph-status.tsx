"use client";

import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Plus,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { KnowledgeGraph } from "@/modules/knowledge-graph/knowledge-graph.types";

interface KnowledgeGraphStatusProps {
  knowledgeGraph: KnowledgeGraph | null | undefined;
  onViewKnowledgeGraph?: () => void;
  viewKnowledgeGraphLink?: string;
  showCompletedStatus?: boolean;
  isAuthor?: boolean;
  onGenerateKnowledgeGraph?: () => void;
  isGenerating?: boolean;
  onRetryKnowledgeGraph?: () => void;
  isRetrying?: boolean;
}

export function KnowledgeGraphStatus({
  knowledgeGraph,
  onViewKnowledgeGraph,
  viewKnowledgeGraphLink,
  showCompletedStatus = false,
  isAuthor = false,
  onGenerateKnowledgeGraph,
  isGenerating = false,
  onRetryKnowledgeGraph,
  isRetrying = false,
}: KnowledgeGraphStatusProps) {
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
          text: "Success",
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
  const isCompleted = knowledgeGraph?.status === "completed";
  const shouldShow =
    showCompletedStatus ||
    (knowledgeGraph && knowledgeGraph.status !== "completed");

  if (!shouldShow) return null;

  return (
    <div className="p-4 bg-muted rounded-xl">
      <div className="flex items-center justify-between my-2">
        <div className="flex items-center gap-3">
          <div className={statusInfo.color}>{statusInfo.icon}</div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Knowledge Graph Status
            </p>

            <div>
              <p className={`text-xs ${statusInfo.color}`}>
                <span className="font-bold"> {statusInfo.text}</span>

                {knowledgeGraph?.error && (
                  <span className="text-xs text-red-600 max-w-md truncate">
                    : {knowledgeGraph.error}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {isCompleted && viewKnowledgeGraphLink ? (
          <div>
            <Link href={viewKnowledgeGraphLink}>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2"
              >
                <Eye className="size-4" />
                View Knowledge Graph
              </Button>
            </Link>
          </div>
        ) : !knowledgeGraph && isAuthor && onGenerateKnowledgeGraph ? (
          <div>
            <Button
              onClick={onGenerateKnowledgeGraph}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="rounded-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Clock className="size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Generate Knowledge Graph
                </>
              )}
            </Button>
          </div>
        ) : knowledgeGraph?.status === "failed" &&
          isAuthor &&
          onRetryKnowledgeGraph ? (
          <div>
            <Button
              onClick={onRetryKnowledgeGraph}
              disabled={isRetrying}
              variant="outline"
              size="sm"
              className="rounded-full gap-2"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="size-4" />
                  Retry Generation
                </>
              )}
            </Button>
          </div>
        ) : null}
      </div>

      {knowledgeGraph?.knowledgeGraphData && (
        <div>
          <p className="text-xs text-muted-foreground">
            Last Updated: {new Date(knowledgeGraph.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
