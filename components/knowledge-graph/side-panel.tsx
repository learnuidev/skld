"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  Network,
  Target,
  Minimize2,
  Maximize2,
  X,
  ArrowRight,
  ExternalLink,
  Edit,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Node, Link, GraphData } from "./knowledge-graph.types";
import { getRelationships, getLinkId } from "./knowledge-graph.utils";

const LegendItem = ({
  color,
  label,
  count,
  isDark,
  isSelected,
  onClick,
  isGroupSelected,
}: {
  color: string;
  label: string;
  count: number;
  isDark: boolean;
  isSelected: boolean;
  onClick: () => void;
  isGroupSelected: boolean;
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-all ${
      isSelected
        ? `${isDark ? "bg-slate-700/50" : "bg-slate-200/50"} opacity-100`
        : isGroupSelected
          ? "hover:opacity-50 opacity-30"
          : "hover:opacity-80 opacity-100"
    }`}
  >
    <div
      className={`w-2 h-2 rounded-full ring-2 ${
        isDark ? "ring-white/5" : "ring-black/5"
      } ${isSelected ? "scale-125" : ""}`}
      style={{ backgroundColor: color }}
    />
    <span
      className={`text-xs ${
        isSelected
          ? "font-semibold"
          : isGroupSelected
            ? `${isDark ? "text-slate-400" : "text-slate-500"}`
            : `${isDark ? "text-slate-200" : "text-slate-700"}`
      } ${isDark ? "text-white" : "text-slate-900"}`}
    >
      {label}
      <span
        className={`ml-1 ${
          isGroupSelected && !isSelected
            ? "opacity-50"
            : `${isDark ? "text-slate-500" : "text-slate-400"}`
        }`}
      >
        ({count})
      </span>
    </span>
  </div>
);

export const SidePanel = ({
  totalNodes,
  // actorCount,
  // attributeCount,
  // motivationCount,
  linkCount,
  activeNode,
  graphData,
  onReset,
  onLinkClick,
  selectedLink,
  stats,
  courseId,
  contentId,
  isEditing = false,
  onEditNode,
  onEditLink,
  selectedGroup,
  onGroupClick,
}: {
  totalNodes: number;
  actorCount: number;
  attributeCount: number;
  motivationCount: number;
  linkCount: number;
  activeNode: Node | null;
  graphData: GraphData;
  onReset: () => void;
  onLinkClick: (link: Link) => void;
  selectedLink: Link | null;
  stats: { id: string; count: number }[];
  courseId?: string;
  contentId?: string;
  isEditing?: boolean;
  onEditNode?: (node: Node) => void;
  onEditLink?: (link: Link) => void;
  selectedGroup?: string | null;
  onGroupClick?: (group: string | null) => void;
}) => {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";
  const [isMinimized, setIsMinimized] = React.useState(false);

  const relationships = activeNode
    ? getRelationships(graphData, activeNode.id)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className={`w-80 absolute z-10 transition-all duration-300 ${isMinimized ? "top-4 right-4" : "top-4 bottom-4 right-4"}`}
    >
      <Card
        className={`${isDark ? "bg-[rgb(13,14,15)] backdrop-blur-xl border-slate-800/50" : "bg-white/95 backdrop-blur-xl border-slate-200/50"} shadow-xl ${isMinimized ? "" : ""}`}
      >
        <CardContent
          className={`p-6 ${isMinimized ? "py-3" : "h-full flex flex-col"}`}
        >
          <div
            className={cn(
              "flex items-center justify-between",
              isMinimized ? "" : "mb-4"
            )}
          >
            <h3
              className={`font-medium text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              <Network className="w-3 h-3" />
              {selectedGroup || activeNode ? "Filtered" : "Overview"}
            </h3>
            <div className="flex items-center gap-1">
              {(activeNode || selectedGroup) && (
                <button
                  onClick={onReset}
                  className={`hover:${isDark ? "bg-slate-700/50" : "bg-slate-200/50"} rounded p-1 transition-colors`}
                >
                  <X
                    className={`w-3 h-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className={`hover:${isDark ? "bg-slate-700/50" : "bg-slate-200/50"} rounded p-1 transition-colors`}
              >
                {isMinimized ? (
                  <Maximize2
                    className={`w-3 h-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  />
                ) : (
                  <Minimize2
                    className={`w-3 h-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-y-auto"
              >
                {activeNode ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: activeNode.color }}
                          />
                          <h4
                            className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}
                          >
                            {activeNode.label}
                          </h4>
                        </div>
                        {isEditing && onEditNode && (
                          <button
                            onClick={() => onEditNode(activeNode)}
                            className={`hover:${isDark ? "bg-slate-700/50" : "bg-slate-200/50"} rounded p-1 transition-colors`}
                          >
                            <Edit
                              className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                            />
                          </button>
                        )}
                      </div>
                      <p
                        className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} leading-relaxed`}
                      >
                        {activeNode.description}
                      </p>
                    </div>

                    {activeNode.contentId && courseId && (
                      <div
                        className={`p-3 rounded-lg ${isDark ? "bg-slate-800/30 border border-slate-700/50" : "bg-slate-100/30 border border-slate-200/50"}`}
                      >
                        <p
                          className={`text-[10px] uppercase tracking-wider mb-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                        >
                          Related Content
                        </p>
                        <a
                          href={`/courses/${courseId}/contents/${contentId || activeNode.contentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-xs font-medium ${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-500"} transition-colors flex items-center gap-1`}
                        >
                          {activeNode.label}
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                    )}

                    <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />

                    <div className="max-h-[calc(100vh-32rem)] overflow-y-auto">
                      <div
                        className={`text-[10px] uppercase tracking-wider mb-3 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Relationships ({relationships.length})
                      </div>
                      <div className="space-y-2">
                        {relationships.map(
                          ({ link, targetNode, isOutgoing }, index) => {
                            const isSelected =
                              selectedLink &&
                              getLinkId(selectedLink) === getLinkId(link);

                            return (
                              <motion.div
                                key={`${link.source}-${link.target}-${index}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-3 rounded-lg cursor-pointer hover:${isDark ? "bg-slate-700/40" : "bg-slate-200/40"} transition-colors ${isDark ? "bg-slate-800/30" : "bg-slate-100/30"} ${selectedLink && !isSelected ? "opacity-30" : ""}`}
                                onClick={() => onLinkClick(link)}
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <ArrowRight
                                        className="w-3 h-3 text-emerald-400 flex-shrink-0"
                                        style={{
                                          transform: isOutgoing
                                            ? "rotate(0deg)"
                                            : "rotate(180deg)",
                                        }}
                                      />
                                      <span
                                        className={`text-xs font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}
                                      >
                                        {targetNode.label}
                                      </span>
                                      {isEditing && onEditLink && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onEditLink(link);
                                          }}
                                          className={`ml-auto hover:${isDark ? "bg-slate-700/50" : "bg-slate-200/50"} rounded p-1 transition-colors`}
                                        >
                                          <Edit
                                            className={`w-3 h-3 ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
                                          />
                                        </button>
                                      )}
                                    </div>
                                    <p
                                      className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"} leading-relaxed`}
                                    >
                                      {link.description}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-medium text-white uppercase`}
                                    style={{ backgroundColor: link.color }}
                                  >
                                    {link.strength}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="text-3xl font-light text-emerald-400 mb-1">
                        {totalNodes}
                      </div>
                      <div
                        className={`text-[10px] uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      >
                        Total Concepts
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
                      {stats.map((statItem, idx) => {
                        const colors = {
                          0: "#9B6B7C",
                          1: "#4A7A7C",
                          2: "#C4A27A",
                          3: "#D4A5A5",
                          4: "#9CAF88",
                          5: "#C97C5D",
                          6: "#6A7A8E",
                          7: "#C69C6D",
                          8: "#4A4A4A",
                          9: "#F5E6D3",
                          10: "#2C5F2D",
                          11: "#8B3A3A",
                        } as any;
                        return (
                          <LegendItem
                            key={statItem.id}
                            color={colors[idx || 0] || colors[0]}
                            label={statItem.id}
                            count={statItem.count}
                            isDark={isDark}
                            isSelected={selectedGroup === statItem.id}
                            isGroupSelected={!!selectedGroup}
                            onClick={() =>
                              onGroupClick?.(
                                selectedGroup === statItem.id
                                  ? null
                                  : statItem.id
                              )
                            }
                          />
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
                      <div
                        className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}
                      >
                        <span className="text-emerald-400 font-medium">
                          {linkCount} relationships
                        </span>{" "}
                        mapped
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-600/30 to-transparent" />
                      <div
                        className={`flex items-center gap-2 text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        <Target className="w-3 h-3 text-emerald-400" />
                        <span>Click any node to filter</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        <Info className="w-3 h-3 text-amber-400" />
                        <span>Click any link for examples</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};
