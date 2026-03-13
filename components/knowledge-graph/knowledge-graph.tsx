"use client";

import React, { useState, useCallback } from "react";
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
  const [nodeEditorOpen, setNodeEditorOpen] = useState(false);
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Node | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

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
    }
  }, [isEditing, hasChanges, graphData]);

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
      const existingIndex = editedGraphData.nodes.findIndex(
        (n) => n.id === node.id,
      );
      if (existingIndex >= 0) {
        setEditedGraphData((prev) => ({
          ...prev,
          nodes: prev.nodes.map((n) => (n.id === node.id ? node : n)),
        }));
      } else {
        setEditedGraphData((prev) => ({
          ...prev,
          nodes: [...prev.nodes, node],
        }));
      }
    },
    [editedGraphData],
  );

  const handleDeleteNode = useCallback(() => {
    if (!editingNode) return;
    setEditedGraphData((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== editingNode.id),
      links: prev.links.filter(
        (l) =>
          (typeof l.source === "object" ? l.source.id : l.source) !==
            editingNode.id &&
          (typeof l.target === "object" ? l.target.id : l.target) !==
            editingNode.id,
      ),
    }));
    setNodeEditorOpen(false);
    setEditingNode(null);
  }, [editingNode]);

  const handleSaveLink = useCallback(
    (link: Link) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;

      const existingIndex = editedGraphData.links.findIndex(
        (l) =>
          (typeof l.source === "object" ? l.source.id : l.source) ===
            sourceId &&
          (typeof l.target === "object" ? l.target.id : l.target) === targetId,
      );

      if (existingIndex >= 0) {
        setEditedGraphData((prev) => ({
          ...prev,
          links: prev.links.map((l, i) => (i === existingIndex ? link : l)),
        }));
      } else {
        setEditedGraphData((prev) => ({
          ...prev,
          links: [...prev.links, link],
        }));
      }
    },
    [editedGraphData],
  );

  const handleDeleteLink = useCallback(() => {
    if (!editingLink) return;
    const sourceId =
      typeof editingLink.source === "object"
        ? editingLink.source.id
        : editingLink.source;
    const targetId =
      typeof editingLink.target === "object"
        ? editingLink.target.id
        : editingLink.target;

    setEditedGraphData((prev) => ({
      ...prev,
      links: prev.links.filter(
        (l) =>
          !(
            (typeof l.source === "object" ? l.source.id : l.source) ===
              sourceId &&
            (typeof l.target === "object" ? l.target.id : l.target) === targetId
          ),
      ),
    }));
    setLinkEditorOpen(false);
    setEditingLink(null);
    setSelectedLink(null);
  }, [editingLink, setSelectedLink]);

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
  }, [hasChanges, graphData]);

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
