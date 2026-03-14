"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { UseMutationResult } from "@tanstack/react-query";
import { ControlButtons } from "./control-buttons";
import {
  GraphData,
  Node,
  Link,
  KnowledgeGraph as KG,
} from "./knowledge-graph.types";
import { RelationshipPanel } from "./relationship-panel";
import { SidePanel } from "./side-panel";
import { TitlePanel } from "./title-panel";
import { useKnowledgeGraph } from "./use-knowledge-graph";
import { EditControls, NodeEditor, LinkEditor } from "./edit-controls";
import { UpdateKnowledgeGraphParams } from "@/modules/knowledge-graph/use-update-knowledge-graph-mutation";

export function KnowledgeGraph({
  graphData,
  courseId,
  contentId,
  title,
  description,
  sk,
  updateMutation,
}: {
  graphData: GraphData;
  courseId?: string;
  contentId?: string;
  title?: string;
  description?: string;
  sk?: string;
  updateMutation?: UseMutationResult<
    KG,
    Error,
    UpdateKnowledgeGraphParams,
    unknown
  >;
}) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  const [isEditing, setIsEditing] = useState(false);
  const [editedGraphData, setEditedGraphData] = useState<GraphData>(graphData);
  const [history, setHistory] = useState<GraphData[]>([]);
  const [future, setFuture] = useState<GraphData[]>([]);
  const [nodeEditorOpen, setNodeEditorOpen] = useState(false);
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const isUpdatingGraphRef = useRef(false);

  const {
    svgRef,
    isClient,
    deferredActiveNode,
    selectedLink,

    handleReset,

    setSelectedLink,
  } = useKnowledgeGraph(isEditing ? editedGraphData : graphData, isDark);

  const hasChanges =
    JSON.stringify(editedGraphData) !== JSON.stringify(graphData);

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  const pushToHistory = useCallback(
    (newGraphData: GraphData) => {
      setHistory((prev) => [...prev, editedGraphData]);
      setFuture([]);
      setEditedGraphData(newGraphData);
    },
    [editedGraphData],
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;

    setHistory((prev) => {
      const previous = prev[prev.length - 1];
      setEditedGraphData(previous);
      setFuture((future) => [editedGraphData, ...future]);
      return prev.slice(0, -1);
    });
  }, [history, editedGraphData]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;

    setFuture((prev) => {
      const next = prev[0];
      setEditedGraphData(next);
      setHistory((history) => [...history, editedGraphData]);
      return prev.slice(1);
    });
  }, [future, editedGraphData]);

  const handleToggleEdit = useCallback(() => {
    if (isEditing && hasChanges) {
      const confirm = window.confirm(
        "You have unsaved changes. Do you want to discard them?",
      );
      if (!confirm) return;
    }
    setIsEditing((prev) => !prev);
    if (!isEditing) {
      setEditedGraphData(graphData);
      setHistory([]);
      setFuture([]);
    }
  }, [isEditing, hasChanges, graphData]);

  useEffect(() => {
    if (!isEditing) {
      setHistory([]);
      setFuture([]);
    }
  }, [isEditing]);

  const handleAddNode = useCallback(() => {
    setEditingNode(null);
    setNodeEditorOpen(true);
  }, []);

  const handleEditNode = useCallback((node: Node) => {
    setEditingNode(node);
    setNodeEditorOpen(true);
  }, []);

  const handleAddLink = useCallback(() => {
    setEditingLink(null);
    setLinkEditorOpen(true);
  }, []);

  const handleEditLink = useCallback((link: Link) => {
    setEditingLink(link);
    setLinkEditorOpen(true);
  }, []);

  const handleSaveNode = useCallback(
    (node: Node) => {
      if (isUpdatingGraphRef.current) return;
      isUpdatingGraphRef.current = true;

      if (editingNode) {
        const newGraphData = {
          ...editedGraphData,
          nodes: editedGraphData.nodes.map((n) =>
            n.id === node.id ? node : n,
          ),
        };
        pushToHistory(newGraphData);
      } else {
        const newGraphData = {
          ...editedGraphData,
          nodes: [...editedGraphData.nodes, node],
        };
        pushToHistory(newGraphData);
      }

      setTimeout(() => {
        isUpdatingGraphRef.current = false;
      }, 0);
    },
    [editedGraphData, pushToHistory, editingNode],
  );

  const handleDeleteNode = useCallback(() => {
    if (!editingNode) return;
    if (isUpdatingGraphRef.current) return;
    isUpdatingGraphRef.current = true;

    const newGraphData = {
      ...editedGraphData,
      nodes: editedGraphData.nodes.filter((n) => n.id !== editingNode.id),
      links: editedGraphData.links.filter(
        (l) =>
          (typeof l.source === "object" ? l.source.id : l.source) !==
            editingNode.id &&
          (typeof l.target === "object" ? l.target.id : l.target) !==
            editingNode.id,
      ),
    };
    pushToHistory(newGraphData);

    setNodeEditorOpen(false);
    setEditingNode(null);

    setTimeout(() => {
      isUpdatingGraphRef.current = false;
    }, 0);
  }, [editingNode, editedGraphData, pushToHistory]);

  const handleSaveLink = useCallback(
    (link: Link) => {
      if (isUpdatingGraphRef.current) return;
      isUpdatingGraphRef.current = true;

      if (editingLink) {
        const editingSourceId =
          typeof editingLink.source === "object"
            ? editingLink.source.id
            : editingLink.source;
        const editingTargetId =
          typeof editingLink.target === "object"
            ? editingLink.target.id
            : editingLink.target;

        const newGraphData = {
          ...editedGraphData,
          links: editedGraphData.links.map((l) => {
            const lSourceId =
              typeof l.source === "object" ? l.source.id : l.source;
            const lTargetId =
              typeof l.target === "object" ? l.target.id : l.target;
            return lSourceId === editingSourceId &&
              lTargetId === editingTargetId
              ? link
              : l;
          }),
        };
        pushToHistory(newGraphData);
      } else {
        const newGraphData = {
          ...editedGraphData,
          links: [...editedGraphData.links, link],
        };
        pushToHistory(newGraphData);
      }

      setTimeout(() => {
        isUpdatingGraphRef.current = false;
      }, 0);
    },
    [editedGraphData, pushToHistory, editingLink],
  );

  const handleDeleteLink = useCallback(() => {
    if (!editingLink) return;
    if (isUpdatingGraphRef.current) return;
    isUpdatingGraphRef.current = true;

    const sourceId =
      typeof editingLink.source === "object"
        ? editingLink.source.id
        : editingLink.source;
    const targetId =
      typeof editingLink.target === "object"
        ? editingLink.target.id
        : editingLink.target;

    const newGraphData = {
      ...editedGraphData,
      links: editedGraphData.links.filter(
        (l) =>
          !(
            (typeof l.source === "object" ? l.source.id : l.source) ===
              sourceId &&
            (typeof l.target === "object" ? l.target.id : l.target) === targetId
          ),
      ),
    };
    pushToHistory(newGraphData);

    setLinkEditorOpen(false);
    setEditingLink(null);
    setSelectedLink(null);

    setTimeout(() => {
      isUpdatingGraphRef.current = false;
    }, 0);
  }, [editingLink, editedGraphData, pushToHistory, setSelectedLink]);

  const handleSave = useCallback(async () => {
    if (!sk || !updateMutation) return;

    try {
      await updateMutation.mutateAsync({
        sk,
        nodes: editedGraphData.nodes,
        links: editedGraphData.links,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save knowledge graph:", error);
      alert("Failed to save changes. Please try again.");
    }
  }, [sk, updateMutation, editedGraphData]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      const confirm = window.confirm(
        "Are you sure you want to discard your changes?",
      );
      if (!confirm) return;
    }
    setEditedGraphData(graphData);
    setIsEditing(false);
    setHistory([]);
    setFuture([]);
  }, [hasChanges, graphData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditing) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, handleUndo, handleRedo]);

  const currentGraphData = isEditing ? editedGraphData : graphData;

  if (!isClient) return null;

  return (
    <div
      className={`relative w-full h-200 mb-12 overflow-hidden ${isDark ? "bg-[rgb(11,12,13)]" : "bg-slate-50"}`}
    >
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.1))" }}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <TitlePanel
        title={title || "Knowledge Graph"}
        description={description}
      />
      <SidePanel
        stats={Object.entries(
          Object.groupBy(currentGraphData.nodes, (item) => item.group),
        ).map((item) => {
          const [id, items] = item;

          return {
            id: id,
            count: (items || []).length,
          };
        })}
        totalNodes={currentGraphData.nodes.length}
        actorCount={
          currentGraphData.nodes.filter((n) => n.type === "actor").length
        }
        attributeCount={
          currentGraphData.nodes.filter((n) => n.type === "attribute").length
        }
        motivationCount={
          currentGraphData.nodes.filter((n) => n.type === "motivation").length
        }
        linkCount={currentGraphData.links.length}
        activeNode={deferredActiveNode}
        graphData={currentGraphData}
        onReset={handleReset}
        onLinkClick={setSelectedLink}
        selectedLink={selectedLink}
        courseId={courseId}
        contentId={contentId}
        isEditing={isEditing}
        onEditNode={handleEditNode}
        onEditLink={handleEditLink}
      />
      <RelationshipPanel
        link={selectedLink}
        onClose={() => setSelectedLink(null)}
        isEditing={isEditing}
        onEditLink={handleEditLink}
      />
      <ControlButtons
        onResetFilter={handleReset}
        hasFilter={!!deferredActiveNode}
      />
      <EditControls
        isEditing={isEditing}
        onToggleEdit={handleToggleEdit}
        onAddNode={handleAddNode}
        onAddLink={handleAddLink}
        hasChanges={hasChanges}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={updateMutation?.isPending}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <NodeEditor
        node={editingNode}
        isOpen={nodeEditorOpen}
        onClose={() => setNodeEditorOpen(false)}
        onSave={handleSaveNode}
        onDelete={editingNode ? handleDeleteNode : undefined}
      />
      <LinkEditor
        link={editingLink}
        isOpen={linkEditorOpen}
        onClose={() => setLinkEditorOpen(false)}
        onSave={handleSaveLink}
        onDelete={editingLink ? handleDeleteLink : undefined}
        nodes={currentGraphData.nodes}
      />
    </div>
  );
}
