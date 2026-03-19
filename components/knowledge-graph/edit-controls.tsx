"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  X,
  Trash2,
  Link2,
  Undo,
  Redo,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Node, Link } from "./knowledge-graph.types";
import {
  useGenerateLinkRelationshipsMutation,
  LinkRelationship,
} from "@/modules/knowledge-graph/use-gen-link-relationships-mutation";

interface NodeEditorProps {
  node?: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (node: Node) => void;
  onDelete?: () => void;
}

const NODE_COLORS = [
  { name: "Muted Mauve", value: "#9B6B7C" },
  { name: "Deep Sea Teal", value: "#4A7A7C" },
  { name: "Warm Sand", value: "#C4A27A" },
  { name: "Soft Coral", value: "#D4A5A5" },
  { name: "Sage Green", value: "#9CAF88" },
  { name: "Terra Cotta", value: "#C97C5D" },
  { name: "Steel Blue", value: "#6A7A8E" },
  { name: "Golden Brown", value: "#C69C6D" },
  { name: "Charcoal", value: "#4A4A4A" },
  { name: "Cream", value: "#F5E6D3" },
  { name: "Forest Green", value: "#2C5F2D" },
  { name: "Burgundy", value: "#8B3A3A" },
];

const NODE_GROUPS = ["concept", "attribute", "instance", "example"];

const NODE_WEIGHTS = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
];

export function NodeEditor({
  node,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: NodeEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  const [formData, setFormData] = useState({
    id: "",
    group: "",
    type: "",
    label: "",
    description: "",
    examples: "",
    color: "#9B6B7C",
    weight: 1,
    contentId: "",
  });

  useEffect(() => {
    if (node) {
      setFormData({
        id: node.id,
        group: node.group,
        type: node.type,
        label: node.label,
        description: node.description,
        examples: node.examples.join("\n"),
        color: node.color,
        weight: node.weight,
        contentId: node.contentId,
      });
    } else {
      setFormData({
        id: "",
        group: "",
        type: "",
        label: "",
        description: "",
        examples: "",
        color: "#9B6B7C",
        weight: 1,
        contentId: "",
      });
    }
  }, [node, isOpen]);

  const handleSave = () => {
    const nodeData: Node = {
      id: formData.id || `node_${Date.now()}`,
      group: formData.group || formData.type || "concept",
      type: formData.type || formData.group || "concept",
      label: formData.label,
      description: formData.description,
      examples: formData.examples
        .split("\n")
        .filter((e) => e.trim())
        .slice(0, 4),
      color: formData.color,
      weight: formData.weight,
      contentId: formData.contentId || "",
    };
    onSave(nodeData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          isDark
            ? "bg-[rgb(13,14,15)] border-slate-800"
            : "bg-white border-slate-200"
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              "text-xl font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {node ? "Edit Node" : "Add New Node"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
                Label
              </Label>
              <Input
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="Node label"
                className={cn(
                  isDark
                    ? "bg-slate-900 border-slate-700 text-white"
                    : "bg-slate-50 border-slate-300"
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
                Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value, group: value })
                }
              >
                <SelectTrigger
                  className={cn(
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300"
                  )}
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent
                  className={
                    isDark
                      ? "bg-slate-900 border-slate-700"
                      : "bg-white border-slate-200"
                  }
                >
                  {NODE_GROUPS.map((group) => (
                    <SelectItem
                      key={group}
                      value={group}
                      className={isDark ? "text-white" : "text-slate-900"}
                    >
                      {group.charAt(0).toUpperCase() + group.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Clear, concise definition"
              rows={3}
              className={cn(
                isDark
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
              Examples (one per line)
            </Label>
            <Textarea
              value={formData.examples}
              onChange={(e) =>
                setFormData({ ...formData, examples: e.target.value })
              }
              placeholder="Example 1&#10;Example 2&#10;Example 3"
              rows={3}
              className={cn(
                isDark
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300"
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
                Color
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {NODE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, color: color.value })
                    }
                    className={cn(
                      "w-full aspect-square rounded-md border-2 transition-all",
                      formData.color === color.value
                        ? "border-emerald-500 ring-2 ring-emerald-500 ring-offset-2"
                        : isDark
                          ? "border-slate-700"
                          : "border-slate-300"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
                Weight
              </Label>
              <Select
                value={formData.weight.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, weight: parseInt(value) })
                }
              >
                <SelectTrigger
                  className={cn(
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300"
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    isDark
                      ? "bg-slate-900 border-slate-700"
                      : "bg-white border-slate-200"
                  }
                >
                  {NODE_WEIGHTS.map((w) => (
                    <SelectItem
                      key={w.value}
                      value={w.value.toString()}
                      className={isDark ? "text-white" : "text-slate-900"}
                    >
                      {w.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
              Content ID (optional)
            </Label>
            <Input
              value={formData.contentId}
              onChange={(e) =>
                setFormData({ ...formData, contentId: e.target.value })
              }
              placeholder="Related content ID"
              className={cn(
                isDark
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300"
              )}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={!formData.label}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {node ? "Save Changes" : "Add Node"}
            </Button>
            {onDelete && node && (
              <Button
                onClick={onDelete}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className={cn(
                isDark
                  ? "border-slate-700 text-slate-300"
                  : "border-slate-300 text-slate-700"
              )}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface LinkEditorProps {
  link?: Link | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (link: Link) => void;
  onDelete?: () => void;
  nodes: Node[];
}

const LINK_COLORS = [
  { name: "Muted Mauve", value: "#9B6B7C" },
  { name: "Deep Sea Teal", value: "#4A7A7C" },
  { name: "Warm Sand", value: "#C4A27A" },
  { name: "Soft Coral", value: "#D4A5A5" },
  { name: "Sage Green", value: "#9CAF88" },
  { name: "Terra Cotta", value: "#C97C5D" },
  { name: "Steel Blue", value: "#6A7A8E" },
];

const LINK_STRENGTHS = ["high", "medium", "low"] as const;
const LINK_VALUES = { high: 3, medium: 2, low: 1 };

export function LinkEditor({
  link,
  isOpen,
  onClose,
  onSave,
  onDelete,
  nodes,
}: LinkEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  const [formData, setFormData] = useState({
    source: "",
    target: "",
    value: 2,
    description: "",
    realExample: "",
    strength: "medium" as Link["strength"],
    color: "#4A7A7C",
  });

  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<LinkRelationship[]>(
    []
  );

  const generateLinkRelationships = useGenerateLinkRelationshipsMutation();

  useEffect(() => {
    if (link) {
      setFormData({
        source: typeof link.source === "object" ? link.source.id : link.source,
        target: typeof link.target === "object" ? link.target.id : link.target,
        value: link.value,
        description: link.description,
        realExample: link.realExample,
        strength: link.strength,
        color: link.color,
      });
    } else {
      setFormData({
        source: "",
        target: "",
        value: 2,
        description: "",
        realExample: "",
        strength: "medium",
        color: "#4A7A7C",
      });
      setShowRecommendations(false);
      setRecommendations([]);
    }
  }, [link, isOpen]);

  const handleSave = () => {
    const linkData: Link = {
      source: formData.source,
      target: formData.target,
      value: LINK_VALUES[formData.strength],
      description: formData.description,
      realExample: formData.realExample,
      strength: formData.strength,
      color: formData.color,
    };
    onSave(linkData);
    onClose();
  };

  const handleGenerateRecommendations = async () => {
    if (!formData.source || !formData.target) return;

    const sourceNode = nodes.find((n) => n.id === formData.source);
    const targetNode = nodes.find((n) => n.id === formData.target);

    if (!sourceNode || !targetNode) return;

    try {
      generateLinkRelationships
        .mutateAsync({
          sourceNode: {
            id: sourceNode.id,
            label: sourceNode.label,
            type: sourceNode.type,
            group: sourceNode.group,
            description: sourceNode.description,
            examples: sourceNode.examples,
          },
          targetNode: {
            id: targetNode.id,
            label: targetNode.label,
            type: targetNode.type,
            group: targetNode.group,
            description: targetNode.description,
            examples: targetNode.examples,
          },
        })
        .then((result) => {
          console.log("RESULT", result);
          setRecommendations(result);
          setShowRecommendations(true);
        });
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
      alert("Failed to generate recommendations. Please try again.");
    }
  };

  const handleApplyRecommendation = (recommendation: LinkRelationship) => {
    setFormData({
      ...formData,
      description: recommendation.description,
      realExample: recommendation.realExample,
      strength: recommendation.strength,
      value: LINK_VALUES[recommendation.strength],
    });
    setShowRecommendations(false);
  };

  const canGenerateRecommendations = formData.source && formData.target;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          isDark
            ? "bg-[rgb(13,14,15)] border-slate-800"
            : "bg-white border-slate-200"
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              "text-xl font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {link ? "Edit Link" : "Add New Link"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
                Source Node
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value) =>
                  setFormData({ ...formData, source: value })
                }
              >
                <SelectTrigger
                  className={cn(
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300"
                  )}
                >
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent
                  className={
                    isDark
                      ? "bg-slate-900 border-slate-700"
                      : "bg-white border-slate-200"
                  }
                >
                  {nodes.map((node) => (
                    <SelectItem
                      key={node.id}
                      value={node.id}
                      className={isDark ? "text-white" : "text-slate-900"}
                    >
                      {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
                Target Node
              </Label>
              <Select
                value={formData.target}
                onValueChange={(value) =>
                  setFormData({ ...formData, target: value })
                }
              >
                <SelectTrigger
                  className={cn(
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300"
                  )}
                >
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent
                  className={
                    isDark
                      ? "bg-slate-900 border-slate-700"
                      : "bg-white border-slate-200"
                  }
                >
                  {nodes.map((node) => (
                    <SelectItem
                      key={node.id}
                      value={node.id}
                      className={isDark ? "text-white" : "text-slate-900"}
                    >
                      {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Explanation of relationship"
              rows={2}
              className={cn(
                isDark
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
              Real World Example
            </Label>
            <Textarea
              value={formData.realExample}
              onChange={(e) =>
                setFormData({ ...formData, realExample: e.target.value })
              }
              placeholder="Specific real-world example"
              rows={2}
              className={cn(
                isDark
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300"
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
                Strength
              </Label>
              <Select
                value={formData.strength}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    strength: value as Link["strength"],
                    value: LINK_VALUES[value as Link["strength"]],
                  })
                }
              >
                <SelectTrigger
                  className={cn(
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300"
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className={
                    isDark
                      ? "bg-slate-900 border-slate-700"
                      : "bg-white border-slate-200"
                  }
                >
                  {LINK_STRENGTHS.map((strength) => (
                    <SelectItem
                      key={strength}
                      value={strength}
                      className={isDark ? "text-white" : "text-slate-900"}
                    >
                      {strength.charAt(0).toUpperCase() + strength.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
                Color
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {LINK_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, color: color.value })
                    }
                    className={cn(
                      "w-full aspect-square rounded-md border-2 transition-all",
                      formData.color === color.value
                        ? "border-emerald-500 ring-2 ring-emerald-500 ring-offset-2"
                        : isDark
                          ? "border-slate-700"
                          : "border-slate-300"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {canGenerateRecommendations && (
            <Button
              onClick={handleGenerateRecommendations}
              disabled={generateLinkRelationships.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2"
            >
              {generateLinkRelationships.isPending ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span>Generating recommendations...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Suggest relationship</span>
                </>
              )}
            </Button>
          )}

          <AnimatePresence>
            {showRecommendations && recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label className={isDark ? "text-slate-200" : "text-slate-700"}>
                  AI Recommendations
                </Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recommendations.map((rec, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleApplyRecommendation(rec)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all hover:scale-[1.02]",
                        isDark
                          ? "bg-slate-900/50 border-slate-700 hover:border-purple-500"
                          : "bg-slate-50 border-slate-300 hover:border-purple-500"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-1 rounded-full",
                            rec.strength === "high"
                              ? "bg-red-100 text-red-700"
                              : rec.strength === "medium"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          )}
                        >
                          {rec.strength.toUpperCase()} STRENGTH
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-sm font-medium mb-1",
                          isDark ? "text-white" : "text-slate-900"
                        )}
                      >
                        {rec.description}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isDark ? "text-slate-400" : "text-slate-600"
                        )}
                      >
                        {rec.realExample}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={!formData.source || !formData.target}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {link ? "Save Changes" : "Add Link"}
            </Button>
            {onDelete && link && (
              <Button
                onClick={onDelete}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="outline"
              className={cn(
                isDark
                  ? "border-slate-700 text-slate-300"
                  : "border-slate-300 text-slate-700"
              )}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface EditControlsProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onAddNode: () => void;
  onAddLink: () => void;
  hasChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function EditControls({
  isEditing,
  onToggleEdit,
  onAddNode,
  onAddLink,
  hasChanges,
  onSave,
  onCancel,
  isSaving = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}: EditControlsProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
    >
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl backdrop-blur-xl",
          isDark
            ? "bg-[rgb(13,14,15)]/90 border border-slate-800/50"
            : "bg-white/90 border border-slate-200/50"
        )}
      >
        {!isEditing ? (
          <Button
            onClick={onToggleEdit}
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 transition-all duration-300",
              isDark
                ? "bg-slate-800/50 border-slate-700 text-slate-200 hover:bg-slate-700/50"
                : "bg-slate-100/50 border-slate-300 text-slate-700 hover:bg-slate-200/50"
            )}
          >
            <Edit className="w-4 h-4" />
            <span className="font-medium">Edit Graph</span>
          </Button>
        ) : (
          <>
            <Button
              onClick={onAddNode}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Node</span>
            </Button>
            <Button
              onClick={onAddLink}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Link2 className="w-4 h-4" />
              <span className="font-medium">Link</span>
            </Button>
            <div className="w-px h-6 bg-slate-600/30" />
            <Button
              onClick={onUndo}
              variant="ghost"
              size="sm"
              disabled={!canUndo || isSaving}
              className={cn(
                "gap-2",
                isDark
                  ? "text-slate-400 hover:text-slate-200 disabled:opacity-30"
                  : "text-slate-500 hover:text-slate-700 disabled:opacity-30"
              )}
              title="Undo (Cmd/Ctrl + Z)"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              onClick={onRedo}
              variant="ghost"
              size="sm"
              disabled={!canRedo || isSaving}
              className={cn(
                "gap-2",
                isDark
                  ? "text-slate-400 hover:text-slate-200 disabled:opacity-30"
                  : "text-slate-500 hover:text-slate-700 disabled:opacity-30"
              )}
              title="Redo (Cmd/Ctrl + Shift + Z)"
            >
              <Redo className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-slate-600/30" />
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              disabled={isSaving}
              className={cn(
                "gap-2",
                isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              onClick={onSave}
              size="sm"
              disabled={!hasChanges || isSaving}
              className={cn(
                "bg-emerald-600 hover:bg-emerald-700 text-white gap-2 transition-all",
                hasChanges && !isSaving ? "animate-pulse" : "opacity-50"
              )}
            >
              {isSaving ? (
                <>
                  <motion.div
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <span className="font-medium">Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="font-medium">Save</span>
                </>
              )}
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}
