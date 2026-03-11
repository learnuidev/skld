"use client";

import { GraphData } from "./knowledge-graph.types";
import { useKnowledgeGraph } from "./use-knowledge-graph";
import { FilterBadge } from "./filter-badge";
import { Legend } from "./legend";
import { RelationshipPanel } from "./relationship-panel";
import { StatsPanel } from "./stats-panel";
import { TitlePanel } from "./title-panel";
import { ControlButtons } from "./control-buttons";
import { Tooltip } from "./tooltip";
import { useTheme } from "next-themes";

export function KnowledgeGraph({ graphData }: { graphData: GraphData }) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";
  const {
    svgRef,
    isClient,
    deferredActiveNode,
    selectedLink,
    tooltip,
    handleReset,
    handleCenter,
    setSelectedLink,
  } = useKnowledgeGraph(graphData, isDark);

  if (!isClient) return null;

  return (
    <div className={`relative w-full h-screen overflow-hidden ${isDark ? "bg-slate-950" : "bg-slate-50"}`}>
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

      <TitlePanel />
      <StatsPanel
        totalNodes={graphData.nodes.length}
        actorCount={graphData.nodes.filter((n) => n.type === "actor").length}
        attributeCount={
          graphData.nodes.filter((n) => n.type === "attribute").length
        }
        motivationCount={
          graphData.nodes.filter((n) => n.type === "motivation").length
        }
        linkCount={graphData.links.length}
      />
      <Legend />
      <FilterBadge activeNode={deferredActiveNode} onReset={handleReset} />
      <RelationshipPanel
        link={selectedLink}
        onClose={() => setSelectedLink(null)}
      />
      <ControlButtons
        onCenter={handleCenter}
        onResetFilter={handleReset}
        hasFilter={!!deferredActiveNode}
      />
      <Tooltip
        content={tooltip.content}
        position={tooltip.position}
        visible={tooltip.visible}
      />
    </div>
  );
}
