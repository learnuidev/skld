"use client";

import { GraphData } from "./knowledge-graph.types";
import { useKnowledgeGraph } from "./use-knowledge-graph";
import { SidePanel } from "./side-panel";
import { RelationshipPanel } from "./relationship-panel";
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
    closeTooltip,
  } = useKnowledgeGraph(graphData, isDark);

  if (!isClient) return null;

  return (
    <div
      className={`relative w-full lg:h-200 mb-12 overflow-hidden ${isDark ? "bg-[rgb(11,12,13)]" : "bg-slate-50"}`}
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

      <TitlePanel />
      <SidePanel
        totalNodes={graphData.nodes.length}
        actorCount={graphData.nodes.filter((n) => n.type === "actor").length}
        attributeCount={
          graphData.nodes.filter((n) => n.type === "attribute").length
        }
        motivationCount={
          graphData.nodes.filter((n) => n.type === "motivation").length
        }
        linkCount={graphData.links.length}
        activeNode={deferredActiveNode}
        graphData={graphData}
        onReset={handleReset}
        onLinkClick={setSelectedLink}
      />
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
        onClose={() => {
          closeTooltip();
        }}
        data={tooltip.data}
        position={tooltip.position}
        visible={tooltip.visible}
      />
    </div>
  );
}
