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

import { NODE_RADIUS, STROKE_WIDTHS } from "./knowledge-graph.constants";
import { GraphData, Link, Node } from "./knowledge-graph.types";

type D3Node = Node & d3.SimulationNodeDatum;
type D3Link = Link & { source: string | D3Node; target: string | D3Node };

export function useKnowledgeGraph(graphData: GraphData, isDark = true) {
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
  const deferredActiveNodeRef = useRef<Node | null>(null);
  const isDarkRef = useRef(isDark);

  const deferredActiveNode = useDeferredValue(activeNode);

  useEffect(() => {
    deferredActiveNodeRef.current = deferredActiveNode;
  }, [deferredActiveNode]);

  useEffect(() => {
    isDarkRef.current = isDark;
  }, [isDark]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNodeClick = useCallback((node: Node) => {
    startTransition(() => {
      setActiveNode((prev) => (prev?.id === node.id ? null : node));
      setSelectedLink(null);
    });
  }, []);

  const handleLinkClick = useCallback((link: D3Link) => {
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
    svg.selectAll("*").remove();

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
      .forceSimulation<D3Node>(graphData.nodes as D3Node[])
      .force(
        "link",
        d3
          .forceLink<D3Node, D3Link>(graphData.links as D3Link[])
          .id((d) => d.id)
          .distance((d) => 200 + (d.value || 0) * 20)
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3
          .forceCollide<D3Node>()
          .radius((d) => (NODE_RADIUS[d.type || ""] || 32) + 5)
      )
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    const link = g
      .append("g")
      .selectAll<SVGLineElement, D3Link>("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", (d) => STROKE_WIDTHS[d.strength || ""] || 2)
      .attr("stroke-opacity", 0.5)
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        handleLinkClick(d);
      })
      .on("mouseover", function (event, d) {
        if (!deferredActiveNodeRef.current) {
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
        if (!deferredActiveNodeRef.current) {
          d3.select(this).attr("stroke-opacity", 0.5);
          setTooltip((t) => ({ ...t, visible: false }));
        }
      });

    const node = g
      .append("g")
      .selectAll<SVGCircleElement, D3Node>("circle")
      .data(graphData.nodes as D3Node[])
      .join("circle")
      .attr("r", (d) => NODE_RADIUS[d.type || ""] || 32)
      .attr("fill", (d) => d.color)
      .attr("stroke", isDarkRef.current ? "#fff" : "#1e293b")
      .attr("stroke-width", 3)
      .attr("cursor", "pointer")
      .call(
        d3
          .drag<SVGCircleElement, D3Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        handleNodeClick(d);
      })
      .on("mouseover", (event, d) => {
        // if (!deferredActiveNodeRef.current) {
        setTooltip({
          content: `<strong class="text-base">${d.label}</strong><br><span class="text-emerald-400">${d.description}</span><br><span class="text-amber-400 text-xs">Click to filter connections</span>`,
          position: { x: event.clientX, y: event.clientY },
          visible: true,
        });
        // }
      })
      .on("mouseout", () => {
        if (!deferredActiveNodeRef.current) {
          setTooltip((t) => ({ ...t, visible: false }));
        }
      });

    const labels = g
      .append("g")
      .selectAll<SVGTextElement, D3Node>("text")
      .data(graphData.nodes as D3Node[])
      .join("text")
      .text((d) => d.label)
      .attr("font-size", (d) => (d.type === "actor" ? "13px" : "12px"))
      .attr("font-weight", "bold")
      .attr("fill", isDarkRef.current ? "#fff" : "#1e293b")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => -(NODE_RADIUS[d.type || ""] || 32) - 10)
      .attr("stroke", isDarkRef.current ? "#000" : "#fff")
      .attr("stroke-width", "0.5")
      .attr("pointer-events", "none")
      .attr("paint-order", "stroke");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as D3Node).x || 0)
        .attr("y1", (d) => (d.source as D3Node).y || 0)
        .attr("x2", (d) => (d.target as D3Node).x || 0)
        .attr("y2", (d) => (d.target as D3Node).y || 0);

      node.attr("cx", (d) => d.x || 0).attr("cy", (d) => d.y || 0);

      labels.attr("x", (d) => d.x || 0).attr("y", (d) => d.y || 0);
    });

    return () => {
      simulation.stop();
    };
  }, [isClient, handleNodeClick, handleLinkClick, graphData]);

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

      g.selectAll<SVGCircleElement, D3Node>("circle")
        .transition()
        .duration(500)
        .attr("opacity", (d) => (connectedNodeIds.has(d.id) ? 1 : 0.15));

      g.selectAll<SVGLineElement, D3Link>("line")
        .transition()
        .duration(500)
        .attr("stroke-opacity", (d) => {
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
      g.selectAll<SVGCircleElement, D3Node>("circle")
        .transition()
        .duration(500)
        .attr("opacity", 1);
      g.selectAll<SVGLineElement, D3Link>("line")
        .transition()
        .duration(500)
        .attr("stroke-opacity", 0.5);
    }
  }, [deferredActiveNode, graphData]);

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

      g.selectAll<SVGLineElement, D3Link>("line")
        .attr("stroke-width", (d) => {
          const dSourceId =
            typeof d.source === "object" ? d.source.id : d.source;
          const dTargetId =
            typeof d.target === "object" ? d.target.id : d.target;
          return dSourceId === sourceId && dTargetId === targetId
            ? (STROKE_WIDTHS[selectedLink.strength || ""] || 2) * 2
            : STROKE_WIDTHS[d.strength || ""] || 2;
        })
        .attr("filter", (d) => {
          const dSourceId =
            typeof d.source === "object" ? d.source.id : d.source;
          const dTargetId =
            typeof d.target === "object" ? d.target.id : d.target;
          return dSourceId === sourceId && dTargetId === targetId
            ? "url(#glow)"
            : "none";
        });
    } else {
      g.selectAll<SVGLineElement, D3Link>("line")
        .attr("stroke-width", (d) => STROKE_WIDTHS[d.strength || ""] || 2)
        .attr("filter", "none");
    }
  }, [selectedLink]);

  return {
    svgRef,
    isClient,
    deferredActiveNode,
    selectedLink,
    tooltip,
    handleReset,
    handleCenter,
    setSelectedLink,
    closeTooltip: () => {
      setTooltip((t) => ({ ...t, visible: false }));
    },
  };
}
