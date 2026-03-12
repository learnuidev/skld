"use client";

import { useTheme } from "next-themes";
import { ControlButtons } from "./control-buttons";
import { GraphData } from "./knowledge-graph.types";
import { RelationshipPanel } from "./relationship-panel";
import { SidePanel } from "./side-panel";
import { TitlePanel } from "./title-panel";
import { useKnowledgeGraph } from "./use-knowledge-graph";

export function KnowledgeGraph({
  graphData,
  courseId,
}: {
  graphData: GraphData;
  courseId?: string;
}) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === "dark" || resolvedTheme === "dark";
  const {
    svgRef,
    isClient,
    deferredActiveNode,
    selectedLink,

    handleReset,

    setSelectedLink,
  } = useKnowledgeGraph(graphData, isDark);

  console.log("GRAPH DATA", graphData);

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
        stats={Object.entries(
          Object.groupBy(graphData.nodes, (item) => item.type),
        ).map((item) => {
          const [id, items] = item;

          return {
            id: id,
            count: (items || []).length,
          };
        })}
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
        selectedLink={selectedLink}
        courseId={courseId}
      />
      <RelationshipPanel
        link={selectedLink}
        onClose={() => setSelectedLink(null)}
      />
      <ControlButtons
        onResetFilter={handleReset}
        hasFilter={!!deferredActiveNode}
      />
    </div>
  );
}
