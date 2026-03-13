"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { KnowledgeGraph } from "@/modules/knowledge-graph/knowledge-graph.types";

interface KnowledgeGraphStatusProps {
  knowledgeGraph: KnowledgeGraph | null | undefined;
  onViewKnowledgeGraph?: () => void;
  viewKnowledgeGraphLink?: string;
  showCompletedStatus?: boolean;
}

export function KnowledgeGraphStatus({
  knowledgeGraph,
  onViewKnowledgeGraph,
  viewKnowledgeGraphLink,
  showCompletedStatus = false,
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
            <p className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</p>
          </div>
        </div>
        {knowledgeGraph?.error && (
          <p className="text-xs text-red-600 max-w-md truncate">
            {knowledgeGraph.error}
          </p>
        )}

        {isCompleted && viewKnowledgeGraphLink && (
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
        )}
      </div>

      {knowledgeGraph?.knowledgeGraphData && (
        <div>
          <p className="text-xs text-muted-foreground">
            Generated: {new Date(knowledgeGraph.updatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
