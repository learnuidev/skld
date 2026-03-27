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

import { STROKE_WIDTHS } from "./knowledge-graph.constants";

import { getRelationships } from "./knowledge-graph.utils";
import {
  GraphData,
  Link,
  Node,
} from "@/modules/knowledge-graph/knowledge-graph.types";

type D3Node = Node & d3.SimulationNodeDatum;
type D3Link = Link & { source: string | D3Node; target: string | D3Node };

const getNodeRadius = (nodeId: string, graphData: GraphData): number => {
  const relationships = getRelationships(graphData, nodeId);
  const relationshipCount = relationships?.length;

  return 6 * Math.pow(relationshipCount, 0.95);
};

export function useKnowledgeGraph(
  graphData: GraphData,
  isDark = true,
  selectedGroup: string | null = null
) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null);
  const [localSelectedGroup, setLocalSelectedGroup] = useState<string | null>(
    null
  );

  const [, startTransition] = useTransition();
  const deferredActiveNodeRef = useRef<Node | null>(null);
  const isDarkRef = useRef(isDark);

  const deferredActiveNode = useDeferredValue(activeNode);
  const deferredSelectedGroup = useDeferredValue(localSelectedGroup);

  useEffect(() => {
    setLocalSelectedGroup(selectedGroup);
  }, [selectedGroup]);

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
      setLocalSelectedGroup(null);
      setActiveNode((prev) => (prev?.id === node.id ? null : node));
      setSelectedLink(null);
    });
  }, []);

  const handleLinkClick = useCallback((link: D3Link) => {
    startTransition(() => {
      setSelectedLink((prev) => (prev === link ? null : link));
    });
  }, []);

  const handleReset = useCallback(() => {
    startTransition(() => {
      setActiveNode(null);
      setSelectedLink(null);
      setLocalSelectedGroup(null);
    });
  }, []);

  const handleGroupClick = useCallback(
    (group: string | null) => {
      startTransition(() => {
        if (localSelectedGroup === group) {
          setLocalSelectedGroup(null);
        } else {
          setLocalSelectedGroup(group);
        }

        setActiveNode(null);
        setSelectedLink(null);
      });
    },
    [localSelectedGroup]
  );

  const handleBackgroundClick = useCallback(() => {
    startTransition(() => {
      setActiveNode(null);
      setSelectedLink(null);
      setLocalSelectedGroup(null);
    });
  }, []);

  useEffect(() => {
    if (!isClient || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth || window.innerWidth;
    const height = container?.clientHeight || window.innerHeight;

    svg.attr("viewBox", [0, 0, width, height]);

    svg.on("click", (event) => {
      if (event.target === svgRef.current || event.target.tagName === "svg") {
        handleBackgroundClick();
      }
    });

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
        d3.forceCollide<D3Node>().radius((d) => getNodeRadius(d.id, graphData))
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
        }
      })
      .on("mouseout", function () {
        if (!deferredActiveNodeRef.current) {
          d3.select(this).attr("stroke-opacity", 0.5);
        }
      });

    const node = g
      .append("g")
      .selectAll<SVGCircleElement, D3Node>("circle")
      .data(graphData.nodes as D3Node[])
      .join("circle")
      .attr("r", (d) => getNodeRadius(d.id, graphData))
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
      .attr("dy", (d) => -getNodeRadius(d.id, graphData))
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
  }, [
    isClient,
    handleNodeClick,
    handleLinkClick,
    handleBackgroundClick,
    graphData,
  ]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = svg.select("g");

    if (deferredSelectedGroup) {
      const groupNodeIds = new Set(
        graphData.nodes
          .filter((node) => node.group === deferredSelectedGroup)
          .map((node) => node.id)
      );

      g.selectAll<SVGCircleElement, D3Node>("circle")
        .transition()
        .duration(500)
        .attr("opacity", (d) => (groupNodeIds.has(d.id) ? 1 : 0.15));

      g.selectAll<SVGTextElement, D3Node>("text")
        .transition()
        .duration(500)
        .attr("opacity", (d) => (groupNodeIds.has(d.id) ? 1 : 0.15));

      g.selectAll<SVGLineElement, D3Link>("line")
        .transition()
        .duration(500)
        .attr("stroke-opacity", (d) => {
          const sourceId =
            typeof d.source === "object" ? d.source.id : d.source;
          const targetId =
            typeof d.target === "object" ? d.target.id : d.target;
          return groupNodeIds.has(sourceId) && groupNodeIds.has(targetId)
            ? 1
            : 0.1;
        });
    } else if (deferredActiveNode) {
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

      g.selectAll<SVGTextElement, D3Node>("text")
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
      g.selectAll<SVGTextElement, D3Node>("text")
        .transition()
        .duration(500)
        .attr("opacity", 1);
      g.selectAll<SVGLineElement, D3Link>("line")
        .transition()
        .duration(500)
        .attr("stroke-opacity", 0.5);
    }
  }, [deferredActiveNode, deferredSelectedGroup, graphData]);

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
        .transition()
        .duration(300)
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
        })
        .attr("stroke-opacity", (d) => {
          const dSourceId =
            typeof d.source === "object" ? d.source.id : d.source;
          const dTargetId =
            typeof d.target === "object" ? d.target.id : d.target;
          return dSourceId === sourceId && dTargetId === targetId ? 1 : 0.15;
        });
    } else {
      g.selectAll<SVGLineElement, D3Link>("line")
        .transition()
        .duration(300)
        .attr("stroke-width", (d) => STROKE_WIDTHS[d.strength || ""] || 2)
        .attr("filter", "none")
        .attr("stroke-opacity", 0.5);
    }
  }, [selectedLink]);

  return {
    svgRef,
    isClient,
    deferredActiveNode,
    selectedLink,
    handleReset,
    handleGroupClick,
    handleBackgroundClick,
    setSelectedLink,
  };
}
