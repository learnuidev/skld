"use client";

import * as d3 from "d3";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

import { FilterBadge } from "./filter-badge";
import { NODE_RADIUS, STROKE_WIDTHS } from "./graph-data";
import { GraphData, Link, Node } from "./knowledge-graph.types";
import { Legend } from "./legend";
import { RelationshipPanel } from "./relationship-panel";
import { StatsPanel } from "./stats-panel";
import { TitlePanel } from "./title-panel";
import { ControlButtons } from "./control-buttons";
import { Tooltip } from "./tooltip";

export function KnowledgeGraph({ graphData }: { graphData: GraphData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [tooltip, setTooltip] = useState<{
    content: string;
    position: { x: number; y: number };
    visible: boolean;
  }>({
    content: "",
    position: { x: 0, y: 0 },
    visible: false,
  });
  const [, startTransition] = useTransition();

  const deferredActiveNode = useDeferredValue(activeNode);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNodeClick = useCallback((node: Node) => {
    startTransition(() => {
      setActiveNode((prev) => (prev?.id === node.id ? null : node));
      setSelectedLink(null);
    });
  }, []);

  const handleLinkClick = useCallback((link: any) => {
    startTransition(() => {
      setSelectedLink((prev) => (prev === link ? null : link));
      setTooltip((t) => ({ ...t, visible: false }));
    });
  }, []);

  const handleReset = useCallback(() => {
    startTransition(() => {
      setActiveNode(null);
      setSelectedLink(null);
    });
  }, []);

  const handleCenter = useCallback(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg
        .transition()
        .duration(750)
        .call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
    }
  }, []);

  useEffect(() => {
    if (!isClient || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = svgRef.current.parentElement;
    const width = container?.clientWidth || window.innerWidth;
    const height = container?.clientHeight || window.innerHeight;

    svg.attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    const simulation = d3
      .forceSimulation(graphData.nodes as any)
      .force(
        "link",
        d3
          .forceLink(graphData.links as any)
          .id((d: any) => d.id)
          .distance((d: any) => 200 + d.value * 20)
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d: any) => (NODE_RADIUS[d.type as string] || 32) + 5)
      )
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    const link = g
      .append("g")
      .selectAll("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke", (d: any) => d.color)
      .attr(
        "stroke-width",
        (d: any) => STROKE_WIDTHS[d.strength as string] || 2
      )
      .attr("stroke-opacity", 0.5)
      .attr("cursor", "pointer")
      .on("click", (event: MouseEvent, d: any) => {
        event.stopPropagation();
        handleLinkClick(d);
      })
      .on("mouseover", function (event: MouseEvent, d: any) {
        if (!deferredActiveNode) {
          d3.select(this).attr("stroke-opacity", 1);
          const sourceLabel =
            typeof d.source === "object"
              ? d.source.label
              : graphData.nodes.find((n) => n.id === d.source)?.label;
          const targetLabel =
            typeof d.target === "object"
              ? d.target.label
              : graphData.nodes.find((n) => n.id === d.target)?.label;
          setTooltip({
            content: `<strong>${sourceLabel}</strong> ↔ <strong>${targetLabel}</strong><br><span class="text-emerald-400">${d.description}</span><br><span class="text-amber-400 text-xs">Click for real-world example</span>`,
            position: { x: event.clientX, y: event.clientY },
            visible: true,
          });
        }
      })
      .on("mouseout", function () {
        if (!deferredActiveNode) {
          d3.select(this).attr("stroke-opacity", 0.5);
          setTooltip((t) => ({ ...t, visible: false }));
        }
      });

    const node = g
      .append("g")
      .selectAll("circle")
      .data(graphData.nodes)
      .join("circle")
      .attr("r", (d: any) => NODE_RADIUS[d.type as string] || 32)
      .attr("fill", (d: any) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .attr("cursor", "pointer")
      .call(
        d3
          .drag()
          .on("start", (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event: any, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any
      )
      .on("click", (event: MouseEvent, d: any) => {
        event.stopPropagation();
        handleNodeClick(d);
      })
      .on("mouseover", (event: MouseEvent, d: any) => {
        if (!deferredActiveNode) {
          setTooltip({
            content: `<strong class="text-base">${d.label}</strong><br><span class="text-emerald-400">${d.description}</span><br><span class="text-amber-400 text-xs">Click to filter connections</span>`,
            position: { x: event.clientX, y: event.clientY },
            visible: true,
          });
        }
      })
      .on("mouseout", () => {
        if (!deferredActiveNode) {
          setTooltip((t) => ({ ...t, visible: false }));
        }
      });

    const labels = g
      .append("g")
      .selectAll("text")
      .data(graphData.nodes)
      .join("text")
      .text((d: any) => {
        const shortLabels: Record<string, string> = {
          unskilled_attacker: "Unskilled Attacker",
          insider_threat: "Insider Threat",
          organized_crime: "Organized Crime",
          shadow_it: "Shadow IT",
          nation_state: "Nation State",
          philosophical_beliefs: "Philosophical",
          service_disruption: "Disruption",
          data_exfiltration: "Data Exfil",
          financial_gain: "Financial",
          internal_external: "Int/Ext",
          resources_funding: "Resources",
          disruption_chaos: "Chaos",
        };
        return shortLabels[d.id] || d.label;
      })
      .attr("font-size", (d: any) => (d.type === "actor" ? "13px" : "12px"))
      .attr("font-weight", "bold")
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("dy", (d: any) => -(NODE_RADIUS[d.type as string] || 32) - 10)
      .attr("stroke", "#000")
      .attr("stroke-width", "0.5")
      .attr("pointer-events", "none")
      .attr("paint-order", "stroke");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      labels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [isClient, deferredActiveNode, handleNodeClick, handleLinkClick]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select("g");

    if (deferredActiveNode) {
      const connectedNodeIds = new Set([deferredActiveNode.id]);
      graphData.links.forEach((link) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        if (sourceId === deferredActiveNode.id) connectedNodeIds.add(targetId);
        if (targetId === deferredActiveNode.id) connectedNodeIds.add(sourceId);
      });

      g.selectAll("circle")
        .transition()
        .duration(500)
        .attr("opacity", (d: any) => (connectedNodeIds.has(d.id) ? 1 : 0.15));

      g.selectAll("line")
        .transition()
        .duration(500)
        .attr("stroke-opacity", (d: any) => {
          const sourceId =
            typeof d.source === "object" ? d.source.id : d.source;
          const targetId =
            typeof d.target === "object" ? d.target.id : d.target;
          return sourceId === deferredActiveNode.id ||
            targetId === deferredActiveNode.id
            ? 1
            : 0.1;
        });
    } else {
      g.selectAll("circle").transition().duration(500).attr("opacity", 1);
      g.selectAll("line")
        .transition()
        .duration(500)
        .attr("stroke-opacity", 0.5);
    }
  }, [deferredActiveNode]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select("g");

    if (selectedLink) {
      const sourceId =
        typeof selectedLink.source === "object"
          ? selectedLink.source.id
          : selectedLink.source;
      const targetId =
        typeof selectedLink.target === "object"
          ? selectedLink.target.id
          : selectedLink.target;

      g.selectAll("line")
        .attr("stroke-width", (d: any) => {
          const dSourceId =
            typeof d.source === "object" ? d.source.id : d.source;
          const dTargetId =
            typeof d.target === "object" ? d.target.id : d.target;
          return dSourceId === sourceId && dTargetId === targetId
            ? (STROKE_WIDTHS[selectedLink.strength as string] || 2) * 2
            : STROKE_WIDTHS[d.strength as string] || 2;
        })
        .attr("filter", (d: any) => {
          const dSourceId =
            typeof d.source === "object" ? d.source.id : d.source;
          const dTargetId =
            typeof d.target === "object" ? d.target.id : d.target;
          return dSourceId === sourceId && dTargetId === targetId
            ? "url(#glow)"
            : "none";
        });
    } else {
      g.selectAll("line")
        .attr(
          "stroke-width",
          (d: any) => STROKE_WIDTHS[d.strength as string] || 2
        )
        .attr("filter", "none");
    }
  }, [selectedLink]);

  if (!isClient) return null;

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
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
